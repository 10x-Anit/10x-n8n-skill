import { listWorkflows, getWorkflow, listExecutions } from './api.js';
import {
  getHead, updateHead,
  getWorkflowRef, setWorkflowRef, listWorkflowRefs,
  saveSnapshot, getSnapshot, getLastCommit,
  commit, computeDiff, saveDiff,
  createBranch, getBranches,
  logExecution, isInitialized,
} from './tracker.js';

/**
 * Sync all workflows from the n8n API.
 * Detects new, changed, and deleted workflows.
 * Creates commits and diffs for changes.
 * Returns a sync report.
 */
export async function syncWorkflows() {
  if (!isInitialized()) {
    throw new Error('Tracker not initialized. Run /n8n-init first.');
  }

  const report = {
    synced_at: new Date().toISOString(),
    new: [],
    changed: [],
    unchanged: [],
    deleted: [],
    errors: [],
  };

  let remoteWorkflows;
  try {
    const response = await listWorkflows();
    remoteWorkflows = response.data || response;
  } catch (err) {
    throw new Error(`Sync failed: ${err.message}`);
  }

  const localRefs = listWorkflowRefs();
  const localIds = new Set(localRefs.map((r) => String(r.id)));
  const remoteIds = new Set();

  for (const wf of remoteWorkflows) {
    const wfId = String(wf.id);
    remoteIds.add(wfId);

    try {
      // Fetch full workflow data
      const fullWf = await getWorkflow(wf.id);
      const newHash = JSON.stringify(fullWf).length.toString(36) + '-' + (fullWf.nodes?.length || 0);

      const localRef = getWorkflowRef(wfId);
      const branchName = `workflow-${wfId}`;
      const branches = getBranches();

      // Ensure branch exists
      if (!branches[branchName]) {
        createBranch(branchName, wfId, `Workflow: ${wf.name}`);
      }

      if (!localRef) {
        // New workflow — first snapshot
        const snapHash = saveSnapshot(wfId, fullWf);
        setWorkflowRef(wfId, fullWf);
        commit(wfId, branchName, `init: ${wf.name} (${fullWf.nodes?.length || 0} nodes)`, snapHash, null);
        report.new.push({ id: wfId, name: wf.name });
      } else {
        // Existing — check for changes
        const lastCommit = getLastCommit(wfId);
        const oldSnapshot = lastCommit ? getSnapshot(wfId, lastCommit.h) : null;
        const snapHash = saveSnapshot(wfId, fullWf);

        if (lastCommit && lastCommit.h !== snapHash) {
          // Changed — compute diff and commit
          const diff = computeDiff(oldSnapshot, fullWf);
          saveDiff(wfId, lastCommit.h, snapHash, diff);
          setWorkflowRef(wfId, fullWf);
          commit(wfId, branchName, `sync: ${diff.summary}`, snapHash, lastCommit.h);
          report.changed.push({ id: wfId, name: wf.name, diff: diff.summary });
        } else {
          report.unchanged.push({ id: wfId, name: wf.name });
        }
      }
    } catch (err) {
      report.errors.push({ id: wfId, name: wf.name, error: err.message });
    }
  }

  // Detect deleted workflows
  for (const localId of localIds) {
    if (!remoteIds.has(localId)) {
      report.deleted.push({ id: localId });
    }
  }

  updateHead({ last_sync: report.synced_at });
  return report;
}

/**
 * Sync recent executions from the API and log them locally.
 */
export async function syncExecutions(limit = 50) {
  const report = { logged: 0, errors: [] };

  try {
    const response = await listExecutions({ limit });
    const executions = response.data || response;

    for (const exec of executions) {
      try {
        logExecution({
          id: exec.id,
          workflowId: exec.workflowId,
          startedAt: exec.startedAt,
          stoppedAt: exec.stoppedAt,
          status: exec.status || (exec.finished ? 'success' : 'running'),
          mode: exec.mode,
          error: exec.data?.resultData?.error?.message || null,
        });
        report.logged++;
      } catch (err) {
        report.errors.push({ id: exec.id, error: err.message });
      }
    }
  } catch (err) {
    throw new Error(`Execution sync failed: ${err.message}`);
  }

  return report;
}

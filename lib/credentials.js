import { getCredentialSchema, createCredential, listCredentials, deleteCredential } from './api.js';
import { readEnv, getCredMap, addCredMapping } from './project.js';

/**
 * Node-to-credential type mapping.
 * Maps n8n node types to their required credential types and which fields map to which env vars.
 */
export const NODE_CREDENTIAL_MAP = {
  'n8n-nodes-base.slack': {
    credentialType: 'slackApi',
    fields: { accessToken: 'SLACK_BOT_TOKEN' },
    description: 'Slack Bot Token (xoxb-...)',
  },
  'n8n-nodes-base.slackTrigger': {
    credentialType: 'slackApi',
    fields: { accessToken: 'SLACK_BOT_TOKEN' },
    description: 'Slack Bot Token (xoxb-...)',
  },
  'n8n-nodes-base.telegram': {
    credentialType: 'telegramApi',
    fields: { accessToken: 'TELEGRAM_BOT_TOKEN' },
    description: 'Telegram Bot Token',
  },
  'n8n-nodes-base.telegramTrigger': {
    credentialType: 'telegramApi',
    fields: { accessToken: 'TELEGRAM_BOT_TOKEN' },
    description: 'Telegram Bot Token',
  },
  'n8n-nodes-base.openAi': {
    credentialType: 'openAiApi',
    fields: { apiKey: 'OPENAI_API_KEY' },
    description: 'OpenAI API Key',
  },
  'n8n-nodes-base.github': {
    credentialType: 'githubApi',
    fields: { accessToken: 'GITHUB_TOKEN' },
    description: 'GitHub Personal Access Token',
  },
  'n8n-nodes-base.githubTrigger': {
    credentialType: 'githubApi',
    fields: { accessToken: 'GITHUB_TOKEN' },
    description: 'GitHub Personal Access Token',
  },
  'n8n-nodes-base.googleSheets': {
    credentialType: 'googleSheetsOAuth2Api',
    fields: { clientId: 'GOOGLE_CLIENT_ID', clientSecret: 'GOOGLE_CLIENT_SECRET' },
    description: 'Google OAuth2 credentials',
  },
  'n8n-nodes-base.gmail': {
    credentialType: 'gmailOAuth2',
    fields: { clientId: 'GOOGLE_CLIENT_ID', clientSecret: 'GOOGLE_CLIENT_SECRET' },
    description: 'Gmail OAuth2 credentials',
  },
  'n8n-nodes-base.notion': {
    credentialType: 'notionApi',
    fields: { apiKey: 'NOTION_API_KEY' },
    description: 'Notion Integration Token',
  },
  'n8n-nodes-base.airtable': {
    credentialType: 'airtableTokenApi',
    fields: { accessToken: 'AIRTABLE_TOKEN' },
    description: 'Airtable Personal Access Token',
  },
  'n8n-nodes-base.discord': {
    credentialType: 'discordBotApi',
    fields: { botToken: 'DISCORD_BOT_TOKEN' },
    description: 'Discord Bot Token',
  },
  'n8n-nodes-base.httpRequest': {
    credentialType: null, // Varies — user configures per-request
    fields: {},
    description: 'HTTP Request — credential type depends on auth method',
  },
  'n8n-nodes-base.sendGrid': {
    credentialType: 'sendGridApi',
    fields: { apiKey: 'SENDGRID_API_KEY' },
    description: 'SendGrid API Key',
  },
  'n8n-nodes-base.stripe': {
    credentialType: 'stripeApi',
    fields: { secretKey: 'STRIPE_SECRET_KEY' },
    description: 'Stripe Secret Key (sk_...)',
  },
  'n8n-nodes-base.stripeTrigger': {
    credentialType: 'stripeApi',
    fields: { secretKey: 'STRIPE_SECRET_KEY' },
    description: 'Stripe Secret Key (sk_...)',
  },
  'n8n-nodes-base.supabase': {
    credentialType: 'supabaseApi',
    fields: { host: 'SUPABASE_URL', serviceRole: 'SUPABASE_SERVICE_KEY' },
    description: 'Supabase URL + Service Role Key',
  },
  'n8n-nodes-base.postgres': {
    credentialType: 'postgres',
    fields: { host: 'PG_HOST', database: 'PG_DATABASE', user: 'PG_USER', password: 'PG_PASSWORD' },
    description: 'PostgreSQL connection details',
  },
  'n8n-nodes-base.mysql': {
    credentialType: 'mySql',
    fields: { host: 'MYSQL_HOST', database: 'MYSQL_DATABASE', user: 'MYSQL_USER', password: 'MYSQL_PASSWORD' },
    description: 'MySQL connection details',
  },
  '@n8n/n8n-nodes-langchain.lmChatOpenAi': {
    credentialType: 'openAiApi',
    fields: { apiKey: 'OPENAI_API_KEY' },
    description: 'OpenAI API Key (for LangChain chat)',
  },
  '@n8n/n8n-nodes-langchain.lmChatAnthropic': {
    credentialType: 'anthropicApi',
    fields: { apiKey: 'ANTHROPIC_API_KEY' },
    description: 'Anthropic API Key',
  },
};

/**
 * Analyze a workflow and determine which credentials are needed.
 * Returns a list of { node, credentialType, envVars, description }.
 */
export function analyzeCredentialNeeds(workflowData) {
  const needs = [];
  const seen = new Set();

  for (const node of workflowData.nodes || []) {
    const mapping = NODE_CREDENTIAL_MAP[node.type];
    if (!mapping || !mapping.credentialType) continue;

    // Deduplicate by credential type
    if (seen.has(mapping.credentialType)) continue;
    seen.add(mapping.credentialType);

    needs.push({
      node: node.name,
      nodeType: node.type,
      credentialType: mapping.credentialType,
      envVars: Object.values(mapping.fields),
      fields: mapping.fields,
      description: mapping.description,
    });
  }

  return needs;
}

/**
 * Check which env vars are missing for a project's credential needs.
 */
export function checkMissingEnvVars(slug, workflowData) {
  const needs = analyzeCredentialNeeds(workflowData);
  const env = readEnv(slug);
  const missing = [];

  for (const need of needs) {
    for (const envVar of need.envVars) {
      if (!env[envVar] || env[envVar].includes('xxx') || env[envVar] === '') {
        missing.push({
          envVar,
          forNode: need.node,
          credentialType: need.credentialType,
          description: need.description,
        });
      }
    }
  }

  return { needs, missing, env };
}

/**
 * Create a credential in n8n using env vars, then map it to the project.
 * Returns the created credential ID.
 */
export async function createCredentialFromEnv(slug, credentialType, fields, envData) {
  // Build the credential data object from env vars
  const credData = {};
  for (const [credField, envVar] of Object.entries(fields)) {
    const value = envData[envVar];
    if (!value) throw new Error(`Missing env var: ${envVar} (needed for ${credField})`);
    credData[credField] = value;
  }

  // Create in n8n
  const result = await createCredential({
    name: `${slug}-${credentialType}`,
    type: credentialType,
    data: credData,
  });

  return result;
}

/**
 * Full credential setup for a project:
 * 1. Analyze which credentials the workflow needs
 * 2. Read env vars
 * 3. Create each credential in n8n
 * 4. Map credentials to nodes in the workflow
 * 5. Update the draft with credential references
 */
export async function setupAllCredentials(slug, workflowData) {
  const env = readEnv(slug);
  const needs = analyzeCredentialNeeds(workflowData);
  const results = [];

  for (const need of needs) {
    try {
      // Check all required env vars are present
      const missingVars = need.envVars.filter((v) => !env[v]);
      if (missingVars.length > 0) {
        results.push({
          node: need.node,
          status: 'skipped',
          reason: `Missing env vars: ${missingVars.join(', ')}`,
        });
        continue;
      }

      // Create credential in n8n
      const cred = await createCredentialFromEnv(slug, need.credentialType, need.fields, env);

      // Map to project
      addCredMapping(slug, need.node, need.credentialType, need.envVars, cred.id);

      // Update the node in workflow to reference this credential
      for (const node of workflowData.nodes) {
        if (node.type === need.nodeType) {
          if (!node.credentials) node.credentials = {};
          node.credentials[need.credentialType] = {
            id: String(cred.id),
            name: cred.name,
          };
        }
      }

      results.push({
        node: need.node,
        status: 'created',
        credentialId: cred.id,
        credentialType: need.credentialType,
      });
    } catch (err) {
      results.push({
        node: need.node,
        status: 'error',
        error: err.message,
      });
    }
  }

  return { results, updatedWorkflow: workflowData };
}

/**
 * Generate a .env template for a workflow's credential needs.
 */
export function generateEnvTemplate(workflowData) {
  const needs = analyzeCredentialNeeds(workflowData);
  const lines = ['# Auto-generated env template for this workflow', '# Fill in your actual values below', ''];

  const seen = new Set();
  for (const need of needs) {
    lines.push(`# ${need.description} — used by: ${need.node}`);
    for (const [credField, envVar] of Object.entries(need.fields)) {
      if (seen.has(envVar)) continue;
      seen.add(envVar);
      lines.push(`${envVar}=`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

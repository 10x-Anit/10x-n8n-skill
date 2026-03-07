# n8n API — Projects

## Overview

Projects group workflows and credentials together for access control. They allow teams to organize resources and define who can access what.

**Availability:** Pro and Enterprise plans only.

## Endpoints

### List Projects

```
GET /api/v1/projects
```

Returns all projects accessible to the API key owner.

### Create Project

```
POST /api/v1/projects
```

**Body:**
```json
{
  "name": "Marketing Automations"
}
```

### Update Project

```
PATCH /api/v1/projects/{id}
```

### Delete Project

```
DELETE /api/v1/projects/{id}
```

## Project Features

- **Resource Grouping:** Organize workflows and credentials by team, department, or function
- **Access Control:** Define who can access project resources
- **Cross-Project Sharing:** Share workflows across projects with fine-grained permissions
- **Custom Roles:** Enterprise plan supports custom project-level roles

## Project Structure

```json
{
  "id": "project-123",
  "name": "Marketing Automations",
  "type": "team",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Access Levels

| Role | Create Workflows | Edit Workflows | View Workflows | Manage Members |
|------|-----------------|---------------|---------------|---------------|
| Project Admin | Yes | Yes | Yes | Yes |
| Project Editor | Yes | Yes | Yes | No |
| Project Viewer | No | No | Yes | No |

**Note:** Project Viewer role is only available on Enterprise plans.

## Plan Availability

| Plan | Projects |
|------|---------|
| Community | No |
| Free Cloud | No |
| Starter Cloud | No |
| Pro Cloud | Yes |
| Enterprise | Yes + custom roles |

## Reference

- https://docs.n8n.io/user-management/rbac/

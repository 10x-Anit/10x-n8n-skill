# n8n API — Users

## Overview

User management via the API is available on Enterprise and Cloud Teams plans. It allows instance owners to create, manage, and remove users with role-based access control.

**Availability:** Enterprise and Cloud Teams plans only.

## Endpoints

### List Users

```
GET /api/v1/users
```

Returns all users on the instance with their roles and status.

### Create/Invite User

```
POST /api/v1/users
```

**Body:**
```json
{
  "email": "user@example.com",
  "role": "editor"
}
```

### Update User

```
PATCH /api/v1/users/{id}
```

**Body:**
```json
{
  "role": "admin"
}
```

### Delete User

```
DELETE /api/v1/users/{id}
```

## User Roles

### Instance-Level Roles

| Role | Description |
|------|-------------|
| **Owner** | Full access, manages instance settings, API keys, users |
| **Admin** | Near-full access, manages users and settings |
| **Editor** | Can create/edit workflows and credentials |
| **Viewer** | Read-only access to workflows and executions |
| **Auditor** | Can view audit logs (Enterprise only) |

### Project-Level Roles

Users can have different roles per project:
- **Project Admin** — Full control within the project
- **Project Editor** — Edit workflows/credentials in the project
- **Project Viewer** — Read-only within the project (Enterprise only)

## RBAC (Role-Based Access Control)

- Users can belong to multiple projects with different roles
- Enterprise plan allows custom project roles
- Credential sharing is controlled per-project

## Permissions Matrix

| Action | Owner | Admin | Editor | Viewer |
|--------|-------|-------|--------|--------|
| Manage instance settings | Yes | Yes | No | No |
| Create API keys | Yes | No | No | No |
| Manage users | Yes | Yes | No | No |
| Create workflows | Yes | Yes | Yes | No |
| View workflows | Yes | Yes | Yes | Yes |
| Execute workflows | Yes | Yes | Yes | No |
| Manage credentials | Yes | Yes | Yes | No |

## Plan Availability

| Plan | User Management |
|------|----------------|
| Community (self-hosted) | Single user only |
| Free Cloud | Single user only |
| Starter Cloud | Limited |
| Pro Cloud | Yes |
| Enterprise | Full RBAC + custom roles |

## Reference

- https://docs.n8n.io/user-management/
- https://docs.n8n.io/user-management/rbac/

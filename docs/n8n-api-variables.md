# n8n API — Variables

## Overview

Variables store fixed data that is accessible across all workflows on an n8n instance. They are useful for shared configuration values like API base URLs, environment names, or feature flags.

**Availability:** Pro and Enterprise plans only (not available on Community or Free Cloud).

## Endpoints

### List Variables

```
GET /api/v1/variables
```

Returns all instance variables.

### Create Variable

```
POST /api/v1/variables
```

**Body:**
```json
{
  "key": "API_BASE_URL",
  "value": "https://api.example.com"
}
```

### Update Variable

```
PATCH /api/v1/variables/{id}
```

**Body:**
```json
{
  "value": "https://api-v2.example.com"
}
```

### Delete Variable

```
DELETE /api/v1/variables/{id}
```

## Use Cases

- Store environment-specific config (`API_BASE_URL`, `ENV_NAME`)
- Shared constants across workflows
- Feature toggles
- External service endpoints

## Accessing Variables in Workflows

In n8n workflow expressions, variables are accessed via:

```
{{ $vars.API_BASE_URL }}
```

## Lifecycle Events

Variable create/update/delete events are tracked and available through:
- Enterprise log streaming
- Audit logging

## Variable Object Structure

```json
{
  "id": "1",
  "key": "API_BASE_URL",
  "value": "https://api.example.com"
}
```

## Plan Availability

| Plan | Variables Available |
|------|-------------------|
| Community (self-hosted) | No |
| Free Cloud | No |
| Starter Cloud | No |
| Pro Cloud | Yes |
| Enterprise | Yes |

## Reference

- https://docs.n8n.io/api/api-reference/

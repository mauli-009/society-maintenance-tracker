# API Reference

Base URL (local): `http://localhost:5000/api`
Base URL (production): `https://YOUR-API.onrender.com/api`

All responses are JSON. Protected routes require an `Authorization: Bearer <token>` header. Roles are `resident` and `admin`.

Standard error shape:
```json
{ "success": false, "message": "Description of what went wrong" }
```

---

## Auth

### Register
`POST /auth/register` — Public

Request body:
```json
{
  "name": "Mauli",
  "email": "mauli@example.com",
  "password": "secret123",
  "flatNumber": "A-101"
}
```

Response `201`:
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Mauli", "email": "...", "role": "resident", "flatNumber": "A-101" }
}
```

### Login
`POST /auth/login` — Public

Request body:
```json
{ "email": "mauli@example.com", "password": "secret123" }
```

Response `200`: same shape as register (token + user).

### Get current user
`GET /auth/me` — Private (any logged-in user)

Response `200`:
```json
{ "success": true, "user": { "id": "...", "name": "...", "email": "...", "role": "...", "flatNumber": "..." } }
```

---

## Complaints

### Create a complaint
`POST /complaints` — Private (resident)

Content-Type: `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `category` | text | yes | Plumbing, Electrical, Cleaning, Security, Elevator, Other |
| `description` | text | yes | |
| `photo` | file | no | Image only, max 5MB |

Response `201`: the created complaint, including a `statusHistory` array seeded with the initial "Open" entry.

### Get my complaints
`GET /complaints/my` — Private (resident)

Returns all complaints belonging to the logged-in resident, newest first.

Response `200`:
```json
{ "success": true, "count": 3, "complaints": [ ... ] }
```

### Get a single complaint
`GET /complaints/:id` — Private (owner resident or admin)

Returns the complaint with populated resident info and status-history actors. Residents can only access their own complaints; admins can access any.

### Get all complaints (admin)
`GET /complaints` — Private (admin)

Query parameters (all optional):
| Param | Example | Description |
|-------|---------|-------------|
| `category` | `Plumbing` | Filter by category |
| `status` | `Open` | Filter by status |
| `priority` | `High` | Filter by priority |
| `startDate` | `2026-07-01` | Created on/after this date |
| `endDate` | `2026-07-09` | Created on/before this date |

Results are sorted overdue-first, then by priority (High → Low), then newest first. The `isOverdue` flag is recomputed on each request.

### Update priority (admin)
`PATCH /complaints/:id/priority` — Private (admin)

Request body:
```json
{ "priority": "High" }
```
Rejected if the complaint is already closed.

### Update status (admin)
`PATCH /complaints/:id/status` — Private (admin)

Request body:
```json
{ "status": "In Progress", "note": "Technician assigned." }
```

Appends a new entry to `statusHistory` (status, note, actor, timestamp). Setting status to `Resolved` closes and locks the complaint and stamps `resolvedAt`. Triggers a status-change email to the resident. Rejected if already closed.

### Dashboard stats (admin)
`GET /complaints/stats/dashboard` — Private (admin)

Response `200`:
```json
{
  "success": true,
  "stats": {
    "totalComplaints": 12,
    "byStatus": { "Open": 5, "In Progress": 3, "Resolved": 4 },
    "byCategory": { "Plumbing": 4, "Electrical": 3, "Cleaning": 5 },
    "overdueCount": 2
  }
}
```

---

## Notices

### Get all notices
`GET /notices` — Private (any logged-in user)

Returns notices sorted important-first (pinned), then newest first.

### Create a notice (admin)
`POST /notices` — Private (admin)

Request body:
```json
{ "title": "Water Shutdown", "content": "No water Sunday 10am–2pm.", "isImportant": true }
```

If `isImportant` is true, the notice is pinned and an email is sent to all residents.

### Delete a notice (admin)
`DELETE /notices/:id` — Private (admin)

Response `200`:
```json
{ "success": true, "message": "Notice deleted" }
```

---

## Status codes used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error / invalid ID |
| 401 | Not authenticated (missing/invalid token) |
| 403 | Authenticated but not authorized for this role/resource |
| 404 | Resource not found |
| 500 | Server error |
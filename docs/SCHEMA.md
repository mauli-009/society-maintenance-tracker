# Database Schema

The database is MongoDB, modeled with Mongoose. There are three collections: **users**, **complaints**, and **notices**. Status history is embedded inside each complaint rather than stored separately.

## Entity relationships

```
User (resident) ──raises──> Complaint ──embeds──> [StatusHistory entries]
User (admin) ────updates──> Complaint
User (admin) ────posts────> Notice
```

- A complaint references the resident who owns it (`resident`).
- Each status-history entry references the user who made the change (`changedBy`).
- A notice references the admin who posted it (`postedBy`).

---

## User

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique, lowercased |
| `password` | String | Required, min 6 chars, hashed with bcrypt, excluded from queries by default |
| `role` | String | `resident` or `admin`, default `resident` |
| `flatNumber` | String | Optional |
| `createdAt` / `updatedAt` | Date | Auto (timestamps) |

Passwords are hashed by a pre-save hook and never returned in API responses. A `matchPassword` instance method compares a plaintext password to the stored hash at login.

---

## Complaint

| Field | Type | Notes |
|-------|------|-------|
| `resident` | ObjectId → User | Required; the complaint owner |
| `category` | String | One of: Plumbing, Electrical, Cleaning, Security, Elevator, Other |
| `description` | String | Required |
| `photoUrl` | String | Cloudinary secure URL (empty if none) |
| `photoPublicId` | String | Cloudinary public ID, used for deletion |
| `status` | String | `Open`, `In Progress`, `Resolved`; default `Open` |
| `priority` | String | `Low`, `Medium`, `High`; default `Medium` |
| `isOverdue` | Boolean | Recomputed on read; persisted for dashboard counts |
| `isClosed` | Boolean | True once resolved; locks further changes |
| `resolvedAt` | Date | Set when status becomes Resolved |
| `statusHistory` | Array of StatusHistory | Embedded, append-only audit trail |
| `createdAt` / `updatedAt` | Date | Auto (timestamps) |

### StatusHistory (embedded sub-document)

| Field | Type | Notes |
|-------|------|-------|
| `status` | String | The status set at this point |
| `note` | String | Optional note explaining the change |
| `changedBy` | ObjectId → User | Who made the change |
| `changedAt` | Date | When the change happened |

The `current` status on the complaint is a denormalized copy of the latest history entry, so listing complaints doesn't require digging into the array. The array itself is never mutated in place — every change appends a new entry, preserving the full history.

---

## Notice

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `content` | String | Required |
| `isImportant` | Boolean | Default false; pins the notice and triggers emails |
| `postedBy` | ObjectId → User | The admin who posted it |
| `createdAt` / `updatedAt` | Date | Auto (timestamps) |

---

## Design notes

**Why embed status history?** The history always belongs to exactly one complaint, is read together with it, and is naturally bounded (a complaint has a handful of status changes, not thousands). Embedding avoids a second collection and an extra query/join, and it keeps the audit trail atomically consistent with the complaint.

**Why store both `photoUrl` and `photoPublicId`?** The URL is for display; the public ID is what Cloudinary needs to delete or replace the image later. Storing both keeps future cleanup simple.

**Why the `isClosed` flag in addition to `status`?** It expresses the lifecycle rule directly: once a complaint is Resolved, it is closed and locked. The flag lets controllers reject further edits with a single, clear check.
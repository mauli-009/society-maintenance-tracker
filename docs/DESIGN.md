# System Design Write-Up

Society Maintenance Tracker is a full-stack complaint-management platform built with a Next.js frontend, an Express/Node backend, and MongoDB. This document explains the architecture and four core design areas: the complaint history model, overdue detection, photo handling, and the notification flow.

## System Architecture

```mermaid
graph TB
    subgraph Client["Frontend — Next.js on Vercel"]
        UI["React Pages<br/>App Router"]
        CTX["Auth + Theme<br/>Context"]
        AX["Axios Client<br/>JWT interceptor"]
        UI --> CTX
        UI --> AX
    end

    subgraph Server["Backend — Express on Render"]
        MW["Middleware<br/>protect · authorize<br/>upload · validateId"]
        RT["Routes<br/>auth · complaints · notices"]
        CTRL["Controllers<br/>business logic"]
        UTIL["Utils<br/>token · overdue · email"]
        MW --> RT --> CTRL --> UTIL
    end

    subgraph Data["Data & External Services"]
        DB[("MongoDB Atlas<br/>users · complaints · notices")]
        CLOUD["Cloudinary<br/>photo storage"]
        MAIL["Resend<br/>email delivery"]
    end

    AX -->|"HTTPS + Bearer JWT"| MW
    CTRL -->|"Mongoose"| DB
    CTRL -->|"upload stream"| CLOUD
    UTIL -->|"fire-and-forget"| MAIL

    classDef client fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#ffffff
    classDef server fill:#d97706,stroke:#7c2d12,stroke-width:2px,color:#ffffff
    classDef data fill:#059669,stroke:#064e3b,stroke-width:2px,color:#ffffff

    class UI,CTX,AX client
    class MW,RT,CTRL,UTIL server
    class DB,CLOUD,MAIL data
```

The frontend is fully decoupled from the backend and talks to it over a REST API. The backend is stateless — all state lives in MongoDB, with photos offloaded to Cloudinary and email to Resend — which lets it scale horizontally and run on ephemeral hosting.

## Complaint History Model

Every status change must be auditable — who changed it, when, and why. This is modeled as an **embedded, append-only array** (`statusHistory`) inside each complaint rather than a separate collection.

```mermaid
graph LR
    HIST["statusHistory[]"]
    E1["Open<br/>by Resident · 10:40"]
    E2["In Progress<br/>by Admin · 11:03<br/>'plumber assigned'"]
    E3["Resolved<br/>by Admin · 14:20<br/>'fixed and tested'"]
    HIST --> E1 --> E2 --> E3

    classDef arr fill:#7c3aed,stroke:#4c1d95,stroke-width:2px,color:#ffffff
    classDef entry fill:#1e293b,stroke:#475569,stroke-width:2px,color:#f1f5f9
    class HIST arr
    class E1,E2,E3 entry
```

Each entry stores the new `status`, an optional `note`, the acting user (`changedBy`), and a timestamp. On creation, the array is seeded with an "Open" entry so the trail begins at birth. Every admin update *appends* a new entry; existing entries are never mutated, guaranteeing a tamper-evident history.

Embedding was chosen over a referenced collection because the history is tightly bound to one complaint, always read with it, and naturally small (a handful of transitions). This avoids a join and keeps history atomically consistent. The complaint also carries a denormalized `status` mirroring the latest entry, so listing complaints is fast.

The lifecycle is enforced in the controller:

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Open: resident raises
    Open --> InProgress: admin updates
    Open --> Resolved: admin resolves
    InProgress --> Resolved: admin resolves
    Resolved --> [*]: closed and locked

    classDef openState fill:#d97706,stroke:#7c2d12,stroke-width:2px,color:#ffffff
    classDef progressState fill:#2563eb,stroke:#1e3a8a,stroke-width:2px,color:#ffffff
    classDef resolvedState fill:#059669,stroke:#064e3b,stroke-width:2px,color:#ffffff

    class Open openState
    class InProgress progressState
    class Resolved resolvedState
```

When status becomes `Resolved`, the complaint is flagged `isClosed`, stamped with `resolvedAt`, and locked — implementing the rule that a resolved complaint is closed.

## Overdue Detection

A complaint is overdue when it stays open beyond a configurable threshold (`OVERDUE_DAYS`, default 3), an env var so it needs no code change. Overdue status is **computed on read**: on each admin fetch, the backend compares every open complaint's age against the threshold. This is always accurate, needs no cron scheduler, and is simple to reason about. Resolved complaints are never overdue.

Overdue complaints surface at the top of the admin view. Sorting is done in JavaScript because priority strings would otherwise sort alphabetically; a numeric weight map yields the correct High → Medium → Low order. Final sort: overdue-first, then priority, then newest. The flag is also persisted via a bulk write so the dashboard's overdue count stays consistent. A daily cron job is a viable alternative but couples freshness to a scheduler; the on-read approach trades minor repeated computation for guaranteed accuracy.

## Photo Handling

```mermaid
sequenceDiagram
    participant R as Resident
    participant M as Multer memory
    participant C as Controller
    participant CL as Cloudinary
    participant DB as MongoDB

    R->>M: POST complaint + photo
    M->>M: validate image, max 5MB
    M->>C: req.file (buffer)
    C->>CL: stream buffer
    CL-->>C: secure URL + public_id
    C->>DB: save complaint + photo fields
    DB-->>R: 201 created
```

Uploads use **Multer** with in-memory storage — the file is held as a buffer, never written to disk (which resets on redeploy). Multer validates image type and caps size before the controller. The buffer is streamed to **Cloudinary**, which returns a secure URL and `public_id`; both are stored (URL for display, ID for later deletion). This keeps the backend stateless and serves images over a CDN. If no photo is sent, the complaint is created with empty photo fields, keeping it optional.

## Notification Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant C as Controller
    participant DB as MongoDB
    participant E as Resend

    A->>C: update status / post important notice
    C->>DB: save change
    DB-->>C: ok
    C-->>A: 200 responds immediately
    C-)E: send email (fire-and-forget)
    Note over C,E: try/catch — never blocks<br/>or breaks the main request
```

Email uses **Resend**. Two events trigger it: a status change (emails the resident) and an important notice (emails all residents). Normal notices send nothing, avoiding spam. The service is **best-effort and non-blocking** — every send is wrapped in try/catch and never throws, so a failed email can't break a status update. Sends are fire-and-forget, so the API responds without awaiting delivery. If the API key is absent, sends skip gracefully.

## Cross-Cutting Concerns

Authentication uses stateless **JWT** with bcrypt-hashed passwords. Two middleware enforce access: `protect` verifies the token and attaches the user; `authorize(role)` restricts admin routes. The backend is the source of truth; frontend role checks are for UX only. CORS is restricted to known origins, and a reusable ObjectId validator returns clean 400s on malformed IDs — together giving clear resident/admin separation while keeping the API stateless and scalable.
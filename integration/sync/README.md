# @automatize/sync

Synchronization engine between local and remote databases.

## What is this?

The sync engine manages bidirectional data synchronization between local WatermelonDB and remote Supabase. It's the bridge that keeps offline data in sync with the cloud.

## How it works

The engine operates in two directions:

**Push (outbox pattern)**: Every local change creates an operation in an outbox queue. Operations are pushed to the server asynchronously. Each operation has a unique ULID, making pushes idempotent.

**Pull (delta sync)**: The engine fetches only changes since the last sync using a cursor. This is efficient even with large datasets.

**Conflict resolution**: When the same record is edited on multiple devices, the engine applies last-write-wins by comparing timestamps. Complex conflicts are logged for manual review.

**Network awareness**: The engine listens to network state changes. When connectivity is restored, sync starts automatically.

## Why this way?

**Never block the UI**: Sync happens in the background. Users never wait for network requests to see their data.

**Idempotent operations**: Using ULIDs for operation IDs means pushing the same operation twice has no side effects. This is critical for unreliable networks.

**Exponential backoff**: Failed sync attempts wait longer each time (1s, 2s, 4s, 8s...). This prevents overwhelming servers and respects battery life.

**Circuit breaker**: After too many failures, the engine pauses briefly. This prevents spiral failures where errors trigger more errors.

## Design decisions

**Why last-write-wins?**
It's simple, predictable, and works well for most cases. More complex resolution (operational transformation, CRDTs) adds significant complexity for marginal benefit in this use case.

**Sync status UX**:
The app shows visual indicators: green for synced, spinner for syncing, red for errors, gray for offline. Users always know the state of their data.

## Current status

Placeholder. Full implementation coming in next phase.

## Related

- See `core/` for interface definitions
- See `integration/storage/` for local database

# @automatize/storage

Local database layer using WatermelonDB.

## What is this?

This package provides the local database infrastructure for offline-first data persistence. All local data operations go through this package.

## How it works

WatermelonDB is a high-performance database optimized for React Native. It provides:

- Lazy loading and efficient queries
- Built-in support for offline-first architecture
- Reactive data (components automatically update when data changes)
- Multi-threading (database operations don't block the UI)

## Why this way?

**Offline-first by default**: The app must work without internet. All data is written to local WatermelonDB first, then synced to the server asynchronously.

**Multi-tenancy at the database level**: Every table has a tenant_id column. Queries are always filtered by tenant.

**Soft delete pattern**: Records are never permanently deleted. Instead, a deleted_at timestamp marks them as deleted. This allows data recovery and maintains referential integrity during sync.

**ULID primary keys**: All tables use ULID for IDs. This works offline because ULIDs can be generated locally without a server.

## Current status

Placeholder. Full implementation coming in next phase.

## Related

- See `core/` for interface definitions
- See `integration/sync/` for sync engine

---

**Last Updated:** 2026-03-25

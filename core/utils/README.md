# @automatize/utils

Shared, platform-agnostic utility functions for Automatize.

## What is this?

Pure utility functions used across the monorepo. No platform dependencies, no React, no Expo — just TypeScript. Every module in the monorepo can safely import from here.

## Exports

```ts
import {
  generateId, // Generate a new ULID
  getCurrentTimestamp, // Current ISO 8601 timestamp
  hashValue, // Basic base64 hash (placeholder — not for production secrets)
} from '@automatize/utils';
```

### `generateId(): string`

Returns a new [ULID](https://github.com/ulid/spec) — a sortable, timestamp-embedded unique identifier used as the standard ID format across all entities.

```ts
const id = generateId(); // e.g. "01ARZ3NDEKTSV4RRFFQ69G5FAV"
```

### `getCurrentTimestamp(): string`

Returns the current UTC time as an ISO 8601 string.

```ts
const ts = getCurrentTimestamp(); // e.g. "2026-03-20T14:32:10.123Z"
```

### `hashValue(value: string): string`

Base64-encodes a string. **This is a placeholder implementation** — use a proper keyed hash (e.g. HMAC-SHA256) for any production secret or PII hashing.

## Rules

- No platform APIs (no `window`, no `navigator`, no React Native, no Expo)
- No React dependencies
- Every export must have unit test coverage
- No business-domain logic — generic helpers only
- `hashValue` must be replaced with a proper algorithm before handling production PII

## Development

```sh
pnpm --filter @automatize/utils test
pnpm --filter @automatize/utils test:unit   # with coverage
pnpm --filter @automatize/utils typecheck
```

---

**Last Updated:** 2026-03-25

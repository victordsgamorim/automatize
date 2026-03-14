/**
 * Secure Storage Adapters for Supabase Auth
 *
 * Supabase JS accepts a custom `storage` option (`auth.storage`) that
 * implements the `{ getItem, setItem, removeItem }` interface.  By supplying
 * a custom implementation we control exactly where tokens are stored and how
 * they are protected.
 *
 * This module exposes:
 *
 * 1. `ISecureStorageAdapter` — the interface Supabase expects for `auth.storage`.
 * 2. `InMemoryStorageAdapter` — stores tokens in a JS Map (no persistence,
 *    safe against XSS; use for SSR/Edge runtimes and unit tests).
 * 3. `CookieStorageAdapter` — delegates to caller-supplied cookie read/write
 *    functions, enabling httpOnly cookie management on the server (e.g. via
 *    Next.js middleware or an Express handler).
 *
 * ## Security rationale
 *
 * `localStorage` is accessible to any JavaScript running on the page
 * (XSS attack surface).  `httpOnly` cookies are invisible to JavaScript and
 * are the recommended approach for web-based token storage.
 *
 * ### Usage with httpOnly cookies (recommended for web)
 *
 * ```ts
 * // In a Next.js Route Handler / middleware:
 * const storage = new CookieStorageAdapter({
 *   get: (key) => cookies().get(key)?.value ?? null,
 *   set: (key, value) => cookies().set(key, value, { httpOnly: true, sameSite: 'lax', secure: true }),
 *   remove: (key) => cookies().delete(key),
 * });
 *
 * const client = createClient<Database>(url, anonKey, {
 *   auth: { storage, autoRefreshToken: true, persistSession: true },
 * });
 * ```
 *
 * ### Usage with expo-secure-store (mobile)
 * Use the existing `MobileTokenStorage` adapter from
 * `./implementations/mobileTokenStorage`.
 */

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Storage interface expected by the Supabase JS client's `auth.storage` option.
 * Mirrors `@supabase/auth-js` `SupportedStorage` type.
 */
export interface ISecureStorageAdapter {
  /** Returns the item stored under `key`, or `null` if absent. */
  getItem(key: string): string | null | Promise<string | null>;
  /** Stores `value` under `key`. */
  setItem(key: string, value: string): void | Promise<void>;
  /** Removes the item stored under `key`. */
  removeItem(key: string): void | Promise<void>;
}

// ---------------------------------------------------------------------------
// In-memory adapter (SSR / test / Edge-safe)
// ---------------------------------------------------------------------------

/**
 * InMemoryStorageAdapter
 *
 * Stores session data in a plain `Map<string, string>`.
 *
 * - **XSS-safe**: data never reaches the DOM or persistent browser storage.
 * - **Non-persistent**: data is lost on page refresh / process restart.
 *
 * Recommended for:
 * - Server-side rendering (SSR / Edge Functions) where persistence is
 *   managed by httpOnly cookies on the request/response cycle.
 * - Unit and integration tests.
 */
export class InMemoryStorageAdapter implements ISecureStorageAdapter {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clears all stored items.  Useful between tests.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Returns the number of items currently stored.
   */
  get size(): number {
    return this.store.size;
  }
}

// ---------------------------------------------------------------------------
// Cookie storage adapter (httpOnly-capable)
// ---------------------------------------------------------------------------

/**
 * Callbacks required by `CookieStorageAdapter`.
 *
 * Callers provide the actual cookie read/write logic; this adapter merely
 * bridges between Supabase and the cookie API (framework-agnostic).
 */
export interface CookieCallbacks {
  /**
   * Read a cookie value by name.
   * Return `null` or `undefined` when the cookie is absent.
   */
  get(name: string): string | null | undefined;

  /**
   * Write a cookie.
   *
   * The cookie **should** be configured as `httpOnly`, `Secure`, and
   * `SameSite=Lax` (or `Strict`) to prevent XSS token theft.
   *
   * @param name  Cookie name.
   * @param value Cookie value (the serialised Supabase session JSON).
   */
  set(name: string, value: string): void;

  /**
   * Delete a cookie by name.
   */
  remove(name: string): void;
}

/**
 * CookieStorageAdapter
 *
 * Delegates all storage operations to caller-supplied cookie callbacks.
 * This enables httpOnly cookie storage when the cookie API is controlled
 * server-side (e.g. Next.js middleware, Express, Hono).
 *
 * Example — Next.js App Router:
 * ```ts
 * import { cookies } from 'next/headers';
 *
 * const cookieStore = cookies();
 * const storage = new CookieStorageAdapter({
 *   get: (name) => cookieStore.get(name)?.value ?? null,
 *   set: (name, value) =>
 *     cookieStore.set(name, value, {
 *       httpOnly: true,
 *       secure: process.env.NODE_ENV === 'production',
 *       sameSite: 'lax',
 *       path: '/',
 *       maxAge: 60 * 60 * 24 * 7, // 7 days
 *     }),
 *   remove: (name) => cookieStore.delete(name),
 * });
 * ```
 */
export class CookieStorageAdapter implements ISecureStorageAdapter {
  constructor(private readonly cookies: CookieCallbacks) {}

  getItem(key: string): string | null {
    return this.cookies.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.cookies.set(key, value);
  }

  removeItem(key: string): void {
    this.cookies.remove(key);
  }
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates an `InMemoryStorageAdapter`.
 * Convenience function for DI containers and tests.
 */
export function createInMemoryStorage(): InMemoryStorageAdapter {
  return new InMemoryStorageAdapter();
}

/**
 * Creates a `CookieStorageAdapter` from the provided callbacks.
 */
export function createCookieStorage(
  callbacks: CookieCallbacks
): CookieStorageAdapter {
  return new CookieStorageAdapter(callbacks);
}

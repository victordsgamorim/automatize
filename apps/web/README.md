# @automatize/web

Web application for desktop browsers.

## What is this?

Production web application built with Next.js 15 using the App Router. Optimized for desktop browsers but works on tablets.

## How it works

The app uses Next.js 15 App Router conventions:

- **(auth)/** — Public routes for authentication
- **(app)/** — Protected routes requiring login

Components use React Server Components by default for performance. Client components are marked with 'use client' directive only where interactivity is needed.

UI components come exclusively from `@automatize/ui` (imported via `@automatize/ui/web`). No local component wrappers — all primitives live in the shared design system package.

## Why this way?

**Next.js 15**: Chosen for its mature ecosystem, excellent performance (SSR, streaming, edge runtime), and good TypeScript support. App Router provides the best developer experience.

**`@automatize/ui`**: Single source of truth for all UI components. Web entry (`@automatize/ui/web`) exports Radix UI + Tailwind-based implementations. No local primitive wrappers allowed in the app.

**Tailwind CSS v4**: Latest version with improved performance, simpler configuration, and excellent developer experience. Works naturally with the design tokens in `@automatize/ui`.

## Directory structure

- **app/** — Next.js App Router pages and layouts
  - **(auth)/** — Public auth routes (login, register, forgot/reset password)
  - **(app)/** — Protected routes requiring login
- **lib/** — Utilities and initialization

Domain-specific composites (sidebar, tables, etc.) go in `app/(app)/components/composites/` when needed. All UI primitives come from `@automatize/ui/web` — no local component folder exists.

## Current status

Authentication and multi-tenancy implemented.

## Environment setup

Next.js public environment variables (NEXT*PUBLIC*\*) are used for Supabase configuration. These are client-safe and bundled with the app.

## Performance considerations

- Server Components reduce JavaScript sent to client
- Images optimized with next/image
- Fonts self-hosted with next/font
- Dynamic imports for heavy components

---

**Last Updated:** 2026-03-25

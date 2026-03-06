# @automatize/web

Web application for desktop browsers.

## What is this?

Production web application built with Next.js 15 using the App Router. Optimized for desktop browsers but works on tablets.

## How it works

The app uses Next.js 15 App Router conventions:

- **(auth)/** — Public routes for authentication
- **(app)/** — Protected routes requiring login

Components use React Server Components by default for performance. Client components are marked with 'use client' directive only where interactivity is needed.

UI is built with Radix UI primitives styled with Tailwind CSS v4. This provides accessible, well-tested components with full styling control.

## Why this way?

**Next.js 15**: Chosen for its mature ecosystem, excellent performance (SSR, streaming, edge runtime), and good TypeScript support. App Router provides the best developer experience.

**Radix UI**: Headless components with excellent accessibility. We style them with Tailwind, giving us full control while inheriting proper ARIA behavior.

**Tailwind CSS v4**: Latest version with improved performance, simpler configuration, and excellent developer experience. Works naturally with the design tokens in @automatize/ui.

## Directory structure

- **app/** — Next.js App Router pages and layouts
- **components/composites/** — Business-specific components (sidebar, table, cards)
- **components/ui/** — Radix UI wrappers and primitives
- **lib/** — Utilities and initialization

## Current status

Authentication and multi-tenancy implemented.

## Environment setup

Next.js public environment variables (NEXT*PUBLIC*\*) are used for Supabase configuration. These are client-safe and bundled with the app.

## Performance considerations

- Server Components reduce JavaScript sent to client
- Images optimized with next/image
- Fonts self-hosted with next/font
- Dynamic imports for heavy components

# @automatize/mobile

Mobile application for iOS and Android.

## What is this?

Cross-platform mobile app built with Expo (React Native). Runs on iOS, Android, and also renders on web via react-native-web.

## How it works

The app uses Expo Router for file-based routing. The file structure in the app directory directly defines routes:

- **(auth)/** — Public authentication screens (login, register, password recovery, MFA)
- **(app)/** — Protected application screens (dashboard, profile, tenant management)

Every route is automatically associated with a URL path. No manual route configuration needed.

The app wraps all routes with an AuthProvider that manages authentication state. Unauthenticated users are automatically redirected to login.

Deep links are handled via Expo Linking. Custom URL schemes (automatize://) allow the app to be opened from email links, SMS, or other apps.

## Why this way?

**Expo Router**: Chosen for its native navigation performance, excellent TypeScript support, and unified API across platforms. It also handles deep linking natively.

**File-based routing**: Makes the routing structure immediately obvious from the file tree. New developers can find any route in seconds.

**Expo**: Provides the best development experience for React Native. Handles native builds, updates, and distribution without requiring a Mac for iOS development.

## Directory structure

- **app/** — All route files (Expo Router convention)
- **lib/** — Initialization code (auth setup)

## Current status

Authentication and multi-tenancy implemented.

## Environment setup

The app requires Supabase credentials in environment variables. These are configured per environment (development, staging, production).

## Testing

Unit tests verify business logic. Integration tests verify auth flows. Manual testing covers all MFA and deep link scenarios.

---

**Last Updated:** 2026-03-25

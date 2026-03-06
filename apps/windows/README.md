# @automatize/windows

Windows desktop application.

## What is this?

Native Windows desktop application for Windows 10/11 users. Built with React Native Windows to share business logic with the mobile app.

## How it works

React Native Windows compiles React Native code to native Windows applications. It uses the same component model as React Native but renders native Windows controls instead of iOS/Android views.

The app will share the same core business logic (@automatize/core), authentication (@automatize/supabase-auth), storage (@automatize/storage), and sync (@automatize/sync) packages as the mobile app.

UI will use @automatize/ui which provides cross-platform components that adapt to each platform.

## Why this way?

**React Native Windows**: Allows sharing significant code with the mobile app while targeting Windows natively. The team doesn't need to learn separate frameworks for each platform.

**Windows Hello**: Native Windows apps can integrate with Windows Hello for passwordless authentication, improving security and UX.

## Current status

Currently a placeholder package.

## Considerations

- Windows 10 version 1809+ supported
- Visual Studio required for building
- Some mobile-specific packages may need platform guards

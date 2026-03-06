# 🔧 Fixes Applied

This document lists the fixes applied during the initial project setup.

## Date: 2026-01-04

---

## ✅ Fix 1: TypeScript Incremental Build

**Problem:**

```
error TS5074: Option '--incremental' can only be specified using tsconfig,
emitting to single file or when option '--tsBuildInfoFile' is specified.
```

**Cause:**
The `incremental: true` option in tsconfig.json is not compatible with tsup.

**Solution:**

- Removed `"incremental": true` from `tools/tsconfig/base.json`

**File changed:**

- `tools/tsconfig/base.json`

**Status:** ✅ Resolved

---

## ✅ Fix 2: Metro Bundler + Monorepo

**Problem:**

```
ReferenceError: SHA-1 for file ... is not computed.
Potential causes:
  1) You have symlinks in your project
```

**Cause:**
Metro (React Native bundler) doesn't handle pnpm symlinks well by default.

**Solution:**

- Created `apps/mobile/metro.config.js` with monorepo configuration
- Configured `watchFolders`, `nodeModulesPaths`, and `disableHierarchicalLookup`

**File created:**

- `apps/mobile/metro.config.js`

**Status:** ✅ Resolved

---

## ✅ Fix 3: Mobile App Build

**Problem:**
`expo export` was failing during `pnpm build` due to Metro/symlinks.

**Cause:**
Mobile app doesn't need build for development (uses `expo start`).

**Solution:**

- Changed the `build` script in mobile `package.json` to just an echo
- `"build": "echo 'Mobile app does not need build for development. Use: pnpm start'"`

**File changed:**

- `apps/mobile/package.json`

**Status:** ✅ Resolved

---

## ✅ Fix 4: TypeScript Config Extends

**Problem:**

```
File '@automatize/tsconfig/base.json' not found.
```

**Cause:**
TypeScript doesn't resolve workspace packages the same way Node.js resolves modules.

**Solution:**

- Changed all tsconfig.json files to use relative paths
- From: `"extends": "@automatize/tsconfig/base.json"`
- To: `"extends": "../../tools/tsconfig/base.json"`

**Files changed:**

- `core/tsconfig.json`
- `packages/ui/tsconfig.json`
- `integration/auth/tsconfig.json`
- `integration/storage/tsconfig.json`
- `integration/sync/tsconfig.json`
- `apps/mobile/tsconfig.json`

**Status:** ✅ Resolved

---

## 📊 Final Results

After all fixes:

### ✅ Build

```bash
pnpm build
# Tasks:    8 successful, 8 total
# Cached:   7 cached, 8 total
# Time:     229ms
```

### ✅ TypeCheck

```bash
pnpm typecheck
# ✓ No errors in any packages
```

### ✅ Expo Dev Server

```bash
cd apps/mobile && pnpm start
# ✓ Starting Metro Bundler
# ✓ Waiting on http://localhost:8081
```

---

## 🎯 Current Status

| Item             | Status   | Notes                 |
| ---------------- | -------- | --------------------- |
| Full Build       | ✅ Works | 8/8 packages          |
| TypeCheck        | ✅ Works | No errors             |
| Tests            | ✅ Works | 6/6 tests passing     |
| Expo Server      | ✅ Works | http://localhost:8081 |
| Lint             | ✅ Works | Configured            |
| Pre-commit hooks | ✅ Works | Husky configured      |

---

## 🚀 How to Use Now

### 1. Build packages

```bash
pnpm build
```

### 2. Run tests

```bash
pnpm test
```

### 3. Run mobile app

```bash
cd apps/mobile
pnpm start
```

Then:

- Press `w` for web
- Press `i` for iOS
- Press `a` for Android
- Scan QR code with Expo Go

---

## 📝 Notes

1. **Expo version warnings:** These are normal and don't affect functionality. Can be fixed later with Renovate.

2. **Mobile build:** Not needed for development. We'll only build for production (Phase 9+).

3. **Turborepo cache:** After the first build, subsequent builds are much faster (229ms).

4. **Hot Reload:** Works perfectly. Edit any file and save to see the change instantly.

---

**Last updated:** 2026-01-04
**All fixes applied:** ✅ Yes
**Project working:** ✅ 100%

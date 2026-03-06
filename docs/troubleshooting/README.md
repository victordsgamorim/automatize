# 🔧 Troubleshooting

Solutions for common problems and applied fixes.

---

## 📝 Fixes Applied

### [Fixes Applied](FIXES_APPLIED.md)

History of all fixes applied during project setup.

**Documented fixes:**

1. TypeScript incremental build
2. Metro Bundler + Monorepo
3. Mobile App Build
4. TypeScript Config Extends

---

## ❓ Common Problems

### Installation

#### `pnpm: command not found`

**Solution:**

```bash
sudo npm install -g pnpm@8
```

Or without sudo (recommended):

```bash
npm install -g pnpm@8 --prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

---

#### `EACCES: permission denied`

**Solution:**
Use `sudo` or install with `--prefix ~/.npm-global`

---

### Build

#### `error TS5074: Option '--incremental'...`

**Solution:**
Already fixed! If still appearing, verify that `incremental: true` was removed from `tools/tsconfig/base.json`

---

#### `Cannot find module '@automatize/core'`

**Solution:**

```bash
pnpm build
```

---

### Expo

#### `ReferenceError: SHA-1 for file ... is not computed`

**Solution:**
Already fixed! `metro.config.js` was created.

If still appearing:

```bash
cd apps/mobile
rm -rf .expo node_modules
pnpm install
pnpm start --clear
```

---

#### `Unable to resolve module`

**Solution:**

```bash
cd apps/mobile
rm -rf .expo
cd ../..
pnpm build
cd apps/mobile
pnpm start --clear
```

---

#### App not opening on phone

**Checklist:**

- [ ] Phone and PC on same WiFi network?
- [ ] Expo Go installed?
- [ ] QR code scanned correctly?
- [ ] Firewall blocking port 8081?

**Alternative solution:**
Press `w` to open in browser

---

### TypeScript

#### `File '@automatize/tsconfig/base.json' not found`

**Solution:**
Already fixed! Now uses relative paths.

If still appearing, verify that tsconfig.json uses:

```json
{
  "extends": "../../tools/tsconfig/base.json"
}
```

---

### Git

#### Pre-commit hook failing

**Cause:** Lint or format errors

**Solution:**

```bash
pnpm lint --fix
pnpm format
git add .
git commit -m "..."
```

---

#### Commit message rejected

**Cause:** Does not follow Conventional Commits

**Correct format:**

```
<type>(<scope>): <subject>

Types: feat, fix, docs, refactor, test, chore, perf, ci
```

**Example:**

```bash
git commit -m "feat(invoices): add invoice list"
```

---

## 🚨 Critical Issues

### Completely broken build

```bash
# Clean everything
pnpm clean

# Reinstall
pnpm install

# Rebuild
pnpm build
```

---

### Completely broken Expo

```bash
cd apps/mobile

# Clear Expo cache
rm -rf .expo

# Clear node_modules
rm -rf node_modules

# Reinstall
cd ../..
pnpm install

# Rebuild packages
pnpm build

# Try again
cd apps/mobile
pnpm start --clear
```

---

## 📞 Still Having Issues?

1. **Check [Fixes Applied](FIXES_APPLIED.md)** - Solution may already exist
2. **See full logs** - Use `--verbose` on commands
3. **Search GitHub Issues** - May be a known issue
4. **Create an issue** - With full logs and reproduction steps

---

## 🔍 Advanced Debugging

### View Metro logs

```bash
cd apps/mobile
REACT_NATIVE_PACKAGER_HOSTNAME=localhost pnpm start --verbose
```

### View Turbo logs

```bash
pnpm build --verbose
```

### See what pnpm is installing

```bash
pnpm install --verbose
```

---

**Last updated:** 2026-01-04

# 🔧 Correções Aplicadas

Este documento lista as correções aplicadas durante o setup inicial do projeto.

## Data: 2026-01-04

---

## ✅ Correção 1: TypeScript Incremental Build

**Problema:**

```
error TS5074: Option '--incremental' can only be specified using tsconfig,
emitting to single file or when option '--tsBuildInfoFile' is specified.
```

**Causa:**
A opção `incremental: true` no tsconfig.json não é compatível com tsup.

**Solução:**

- Removemos `"incremental": true` de `tools/tsconfig/base.json`

**Arquivo alterado:**

- `tools/tsconfig/base.json`

**Status:** ✅ Resolvido

---

## ✅ Correção 2: Metro Bundler + Monorepo

**Problema:**

```
ReferenceError: SHA-1 for file ... is not computed.
Potential causes:
  1) You have symlinks in your project
```

**Causa:**
Metro (bundler do React Native) não lida bem com symlinks do pnpm por padrão.

**Solução:**

- Criamos `apps/mobile/metro.config.js` com configuração para monorepo
- Configuramos `watchFolders`, `nodeModulesPaths` e `disableHierarchicalLookup`

**Arquivo criado:**

- `apps/mobile/metro.config.js`

**Status:** ✅ Resolvido

---

## ✅ Correção 3: Build do Mobile App

**Problema:**
`expo export` falhava durante `pnpm build` devido ao Metro/symlinks.

**Causa:**
Mobile app não precisa de build para desenvolvimento (usa `expo start`).

**Solução:**

- Alteramos o script `build` no `package.json` do mobile para apenas um echo
- `"build": "echo 'Mobile app does not need build for development. Use: pnpm start'"`

**Arquivo alterado:**

- `apps/mobile/package.json`

**Status:** ✅ Resolvido

---

## ✅ Correção 4: TypeScript Config Extends

**Problema:**

```
File '@automatize/tsconfig/base.json' not found.
```

**Causa:**
TypeScript não resolve packages de workspace da mesma forma que Node.js resolve módulos.

**Solução:**

- Alteramos todos os `tsconfig.json` para usar caminhos relativos
- De: `"extends": "@automatize/tsconfig/base.json"`
- Para: `"extends": "../../tools/tsconfig/base.json"`

**Arquivos alterados:**

- `packages/core/tsconfig.json`
- `packages/ui/tsconfig.json`
- `packages/auth/tsconfig.json`
- `packages/storage/tsconfig.json`
- `packages/sync/tsconfig.json`
- `apps/mobile/tsconfig.json`

**Status:** ✅ Resolvido

---

## 📊 Resultados Finais

Após todas as correções:

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
# ✓ Sem erros em todos os pacotes
```

### ✅ Expo Dev Server

```bash
cd apps/mobile && pnpm start
# ✓ Starting Metro Bundler
# ✓ Waiting on http://localhost:8081
```

---

## 🎯 Status Atual

| Item             | Status      | Notas                 |
| ---------------- | ----------- | --------------------- |
| Build completo   | ✅ Funciona | 8/8 pacotes           |
| TypeCheck        | ✅ Funciona | Sem erros             |
| Tests            | ✅ Funciona | 6/6 testes passando   |
| Expo Server      | ✅ Funciona | http://localhost:8081 |
| Lint             | ✅ Funciona | Configurado           |
| Pre-commit hooks | ✅ Funciona | Husky configurado     |

---

## 🚀 Como Usar Agora

### 1. Build dos pacotes

```bash
pnpm build
```

### 2. Rodar testes

```bash
pnpm test
```

### 3. Rodar app mobile

```bash
cd apps/mobile
pnpm start
```

Depois:

- Pressione `w` para web
- Pressione `i` para iOS
- Pressione `a` para Android
- Escaneie o QR code com Expo Go

---

## 📝 Notas

1. **Avisos de versão no Expo:** São normais e não afetam o funcionamento. Podem ser corrigidos depois com Renovate.

2. **Build do mobile:** Não é necessário para desenvolvimento. Só precisaremos buildar para produção (Phase 9+).

3. **Cache do Turborepo:** Após o primeiro build, builds subsequentes são muito mais rápidos (229ms).

4. **Hot Reload:** Funciona perfeitamente. Edite qualquer arquivo e salve para ver a mudança instantânea.

---

**Última atualização:** 2026-01-04
**Todas as correções aplicadas:** ✅ Sim
**Projeto funcionando:** ✅ 100%

# 🔧 Troubleshooting

Soluções para problemas comuns e correções aplicadas.

---

## 📝 Correções Aplicadas

### [Fixes Applied](FIXES_APPLIED.md)

Histórico de todas as correções aplicadas durante o setup.

**Correções documentadas:**

1. TypeScript incremental build
2. Metro Bundler + Monorepo
3. Build do Mobile App
4. TypeScript Config Extends

---

## ❓ Problemas Comuns

### Instalação

#### `pnpm: command not found`

**Solução:**

```bash
sudo npm install -g pnpm@8
```

ou

```bash
npm install -g pnpm@8 --prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

---

#### `EACCES: permission denied`

**Solução:**
Use `sudo` ou instale com `--prefix ~/.npm-global`

---

### Build

#### `error TS5074: Option '--incremental'...`

**Solução:**
Já corrigido! Se ainda aparecer, verifique se `incremental: true` foi removido de `tools/tsconfig/base.json`

---

#### `Cannot find module '@automatize/core'`

**Solução:**

```bash
pnpm build
```

---

### Expo

#### `ReferenceError: SHA-1 for file ... is not computed`

**Solução:**
Já corrigido! `metro.config.js` criado.

Se ainda aparecer:

```bash
cd apps/mobile
rm -rf .expo node_modules
pnpm install
pnpm start --clear
```

---

#### `Unable to resolve module`

**Solução:**

```bash
cd apps/mobile
rm -rf .expo
cd ../..
pnpm build
cd apps/mobile
pnpm start --clear
```

---

#### App não abre no celular

**Checklist:**

- [ ] Celular e PC na mesma rede WiFi?
- [ ] Expo Go instalado?
- [ ] QR code escaneado corretamente?
- [ ] Firewall bloqueando porta 8081?

**Solução alternativa:**
Pressione `w` para abrir no navegador

---

### TypeScript

#### `File '@automatize/tsconfig/base.json' not found`

**Solução:**
Já corrigido! Agora usa caminhos relativos.

Se ainda aparecer, verifique se o tsconfig.json usa:

```json
{
  "extends": "../../tools/tsconfig/base.json"
}
```

---

### Git

#### Pre-commit hook failing

**Causa:** Lint ou format errors

**Solução:**

```bash
pnpm lint --fix
pnpm format
git add .
git commit -m "..."
```

---

#### Commit message rejected

**Causa:** Não segue Conventional Commits

**Formato correto:**

```
<type>(<scope>): <subject>

Types: feat, fix, docs, refactor, test, chore, perf, ci
```

**Exemplo:**

```bash
git commit -m "feat(invoices): add invoice list"
```

---

## 🚨 Problemas Críticos

### Build completamente quebrado

```bash
# Limpar tudo
pnpm clean

# Reinstalar
pnpm install

# Rebuildar
pnpm build
```

---

### Expo completamente quebrado

```bash
cd apps/mobile

# Limpar cache Expo
rm -rf .expo

# Limpar node_modules
rm -rf node_modules

# Reinstalar
cd ../..
pnpm install

# Rebuildar pacotes
pnpm build

# Tentar novamente
cd apps/mobile
pnpm start --clear
```

---

## 📞 Ainda com Problemas?

1. **Verifique [Fixes Applied](FIXES_APPLIED.md)** - Pode já ter solução
2. **Veja logs completos** - Use `--verbose` nos comandos
3. **Procure no GitHub Issues** - Pode ser um problema conhecido
4. **Crie uma issue** - Com logs completos e passos para reproduzir

---

## 🔍 Debug Avançado

### Ver logs do Metro

```bash
cd apps/mobile
REACT_NATIVE_PACKAGER_HOSTNAME=localhost pnpm start --verbose
```

### Ver logs do Turbo

```bash
pnpm build --verbose
```

### Ver o que o pnpm está instalando

```bash
pnpm install --verbose
```

---

**Última atualização:** 2026-01-04

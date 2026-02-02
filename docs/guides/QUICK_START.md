# 🚀 Quick Start - Como Rodar o App AGORA

## 📊 Status Atual

**PHASE 0 completa** ✅ - Infraestrutura pronta
**Funcionalidades:** Apenas tela inicial (sem auth, sem features ainda)

---

## ⚡ Passos Rápidos (5 minutos)

### 1️⃣ Instalar pnpm

Abra o terminal e rode:

```bash
sudo npm install -g pnpm@8
```

Ou, se preferir sem sudo (recomendado):

```bash
npm install -g pnpm@8 --prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
```

**Verifique a instalação:**

```bash
pnpm --version
# Deve mostrar: 8.x.x
```

---

### 2️⃣ Instalar Dependências

No diretório do projeto (`/Users/victor.amorim/Developer/automatize`):

```bash
pnpm install
```

⏱️ Isso vai levar **2-5 minutos** na primeira vez.

**O que vai acontecer:**

- Download de ~500MB de dependências
- Instalação de todas as libs (Expo, React Native, TypeScript, etc.)
- Setup dos workspaces do monorepo

---

### 3️⃣ Build dos Pacotes

```bash
pnpm build
```

⏱️ ~1 minuto

**O que vai acontecer:**

- Build do `@automatize/core`
- Build do `@automatize/ui`
- Build dos outros pacotes
- Geração dos arquivos TypeScript (.d.ts)

---

### 4️⃣ Rodar o App Mobile

```bash
cd apps/mobile
pnpm start
```

**O que vai aparecer:**

```
› Metro waiting on exp://192.168.x.x:8081

› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor

› Press ? │ show all commands
```

---

## 📱 Opções para Visualizar o App

### Opção 1: No seu celular (mais fácil)

1. **Instale o Expo Go:**
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Escaneie o QR code** que apareceu no terminal
3. O app vai abrir no Expo Go

### Opção 2: No simulador iOS (se você tem Mac)

1. Abra o Xcode
2. Abra o simulador: `Xcode > Open Developer Tool > Simulator`
3. No terminal do Expo, pressione `i`

### Opção 3: No emulador Android

1. Abra o Android Studio
2. Configure um AVD (Android Virtual Device)
3. Inicie o emulador
4. No terminal do Expo, pressione `a`

### Opção 4: No navegador (mais rápido para testar)

No terminal do Expo, pressione `w`

O app vai abrir em `http://localhost:8081`

---

## 🎯 O Que Você Vai Ver

Uma tela simples com:

```
┌─────────────────────┐
│                     │
│    Automatize      │
│                     │
│  Invoice Management │
│       System        │
│                     │
└─────────────────────┘
```

**Isso é normal!**

O projeto está na **PHASE 0** (fundação). As funcionalidades virão nas próximas fases:

- **Phase 1:** Login, Register, Multi-tenancy
- **Phase 2:** Banco de dados local, Sync offline
- **Phase 3:** CRUD de Invoices
- **Phase 4:** Clientes
- **Phase 5:** Produtos

---

## 🧪 Testar que Está Tudo Funcionando

### Rodar os testes:

```bash
# Volte para a raiz do projeto
cd /Users/victor.amorim/Developer/automatize

# Rode os testes
pnpm test
```

**Resultado esperado:**

```
✓ packages/core/src/utils/index.test.ts (3)
  ✓ generateId (2)
  ✓ getCurrentTimestamp (2)
  ✓ hashValue (2)

Test Files  1 passed (1)
Tests  6 passed (6)
```

### Rodar o lint:

```bash
pnpm lint
```

### Verificar tipos:

```bash
pnpm typecheck
```

---

## 🐛 Problemas Comuns

### Erro: "command not found: pnpm"

**Solução:** Instale o pnpm (passo 1)

---

### Erro: "Cannot find module '@automatize/core'"

**Solução:** Build os pacotes

```bash
pnpm build
```

---

### Erro no Expo: "Unable to resolve module"

**Solução:** Limpe o cache

```bash
cd apps/mobile
rm -rf node_modules .expo
cd ../..
pnpm install
pnpm build
cd apps/mobile
pnpm start --clear
```

---

### App não abre no celular

**Checklist:**

- [ ] Celular e computador na mesma rede WiFi?
- [ ] Expo Go instalado?
- [ ] QR code escaneado corretamente?
- [ ] Firewall bloqueando a porta 8081?

---

## 📊 Comandos Úteis

```bash
# Ver todos os pacotes
pnpm -r list --depth=0

# Reinstalar tudo do zero
pnpm clean
pnpm install

# Rodar app em modo de produção
cd apps/mobile
pnpm start --no-dev --minify

# Ver logs detalhados
pnpm start --verbose
```

---

## ➡️ Próximos Passos

Depois de rodar o app, você pode:

1. **Começar a Phase 1** (Autenticação)
   - Criar conta no Supabase
   - Configurar autenticação
   - Criar telas de login/register

2. **Explorar o código**
   - Ver os design tokens em `packages/ui/src/tokens/`
   - Ver os tipos em `packages/core/src/types/`
   - Ver os testes em `packages/core/src/utils/index.test.ts`

3. **Fazer mudanças**
   - Edite `apps/mobile/app/index.tsx`
   - Salve o arquivo
   - O app recarrega automaticamente (Fast Refresh)

---

## 💡 Dica Pro

Abra **3 terminais**:

**Terminal 1 - App Mobile:**

```bash
cd apps/mobile
pnpm start
```

**Terminal 2 - Watch Build (opcional):**

```bash
pnpm dev
```

**Terminal 3 - Testes em Watch (opcional):**

```bash
pnpm test:watch
```

---

## 📚 Documentação

- [README.md](README.md) - Visão geral
- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup completo
- [PHASE_0_COMPLETE.md](PHASE_0_COMPLETE.md) - O que foi feito
- [ROADMAP.md](ROADMAP.md) - Próximas fases

---

**Pronto!** 🎉

Qualquer dúvida, é só perguntar!

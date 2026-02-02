## 📋 Overview

This roadmap structures the development of the invoice management system into **incremental phases**, where each phase delivers value and keeps the project **always deployable**.

### Roadmap Principles

1. **Always Deployable:** Each phase delivers incremental value  
2. **Offline-First From Day One:** Don’t postpone it  
3. **Security Built-in:** It’s not a phase, it’s in all phases  
4. **Test as You Go:** Tests in every phase, not later  
5. **Mobile-First:** Web and Desktop are adaptations  
6. **Iterate & Validate:** Validate with users after phases 3–5  

---

## 🎯 Phase Categorization

### Must-Have (MVP)
Phases **0–5**: Foundation → Auth → Offline → Invoices → Clients → Products

### Should-Have (V1)
Phases **6–8**: Analytics → Notifications → i18n

### Nice-to-Have (V2+)
Phases **9–15**: Polish, Desktop, Advanced Features, Monitoring

---

## 📦 PHASE 0: Foundation & Setup

### 0️⃣ Foundation & Setup  
**Goal:** Establish a solid technical base before any feature work.

#### Infrastructure
- Monorepo setup (Turborepo + pnpm)
- Packages structure (`core`, `ui`, `sync`, `storage`, `auth`)
- Apps setup (`mobile`, `web`, `windows` — structure only)
- Supabase setup (dev + staging projects)
- Basic CI/CD pipeline (lint, typecheck, test)

#### Tooling
- ESLint + Prettier configured
- Pre-commit hooks (Husky + lint-staged)
- Commitlint (Conventional Commits)
- Renovate configured
- Vitest setup with sample test

#### Design System Foundation
- Design tokens (colors, spacing, typography)
- Base components (Button, Input, Text, Card)
- Dark mode setup
- Storybook (or similar) for documentation

#### Security Baseline
- Secure storage setup (expo-secure-store)
- Observability structure prepared
- Environment variables structure
- RLS policies template

✅ **Deliverable:** Buildable project, CI passing, ready for features.  

📊 **Completion Criteria:**
- `pnpm build` works for all apps
- CI passes 100% of checks
- At least 1 UI component documented
- Observability integration planned

---

## 🔐 PHASE 1: Auth & Multi-tenancy

### 1️⃣ Authentication & Multi-tenancy  
**Goal:** Working authentication + tenant isolation.

#### Auth
- Supabase Auth integration
- Login/Register screens (mobile + web)
- MFA setup (TOTP)
- Secure token storage
- Session management
- Deep linking for password reset

#### Multi-tenancy
- Tenant model in Supabase
- RLS policies for isolation
- Custom claims in JWT (tenant_id, role)
- Tenant selection/creation flow
- Basic RBAC (admin, editor, viewer)

#### Navigation
- Full Expo Router setup
- Auth flow vs App flow (split)
- Protected routes
- Deep linking tested

✅ **Deliverable:** User can register, login, use MFA, and be isolated in their tenant.

📊 **Completion Criteria:**
- User can register, login, and logout
- Mandatory MFA works
- RLS policies prevent cross-tenant access
- Password reset deep link works
- Basic roles work (admin can, viewer cannot)

---

## 💾 PHASE 2: Offline-First Infrastructure

### 2️⃣ Offline-First Infrastructure  
**Goal:** Local DB + basic sync working (no feature entities yet).

#### WatermelonDB Setup
- Initial schema (User, Tenant only)
- Adapters (SQLite mobile, IndexedDB web)
- Migrations system
- Base models and collections

#### Sync Engine (Basic)
- Outbox table and model
- Push operations (send to Supabase)
- Pull operations (fetch from Supabase)
- Network detection (NetInfo)
- Sync indicators in UI
- Error handling + retry logic
- Conflict resolution (basic LWW)

#### State Management
- Zustand store setup
- TanStack Query setup
- WatermelonDB integration
- Observables and reactive queries

✅ **Deliverable:** App works 100% offline, syncs when online, and shows sync status.

📊 **Completion Criteria:**
- App starts without internet
- Local data persists between sessions
- When connectivity returns, auto-sync happens
- Sync indicator is visible and accurate
- Retry works after sync failure
- Conflicts are resolved (LWW)

---

## 📄 PHASE 3: Invoices (MVP)

### 3️⃣ Invoices (MVP)  
**Goal:** Full CRUD for Invoices (first real feature).

#### Data Layer
- Invoice schema (WatermelonDB + Supabase)
- Invoice model with validations (Zod)
- RLS policies for Invoices
- CRUD operations in core
- Migrations (local + remote)

#### UI — List
- Invoice list (paginated, virtualized)
- Basic filters (status, period)
- Offline search
- Empty state
- Loading states (skeleton)

#### UI — CRUD
- Create invoice screen
- Edit screen
- View/details screen
- Soft delete
- Form validation (Zod)

#### Invoice-specific Sync
- Invoice sync support
- Conflict resolution for invoices
- Offline indicators on cards

#### Tests
- Unit tests (calculations, validations)
- Integration tests (CRUD flow)
- Basic E2E (create invoice offline → sync)

✅ **Deliverable:** User can create, edit, view, and delete invoices (offline + sync).

📊 **Completion Criteria:**
- Full CRUD works offline
- Invoice sync works
- List with 1000+ invoices does not freeze
- Search returns instant results
- Validations prevent invalid data
- Tests pass (coverage > 80%)

---

## 👥 PHASE 4: Clients

### 4️⃣ Clients Management  
**Goal:** Client management + invoice relationship.

#### Data Layer
- Client schema (WatermelonDB + Supabase)
- Client model with validations
- RLS policies for Clients
- Invoice ↔ Client relationship
- Migrations

#### UI
- Client list (paginated)
- Client CRUD
- Client picker in Invoice form
- Client details with invoice list

#### Business Logic
- Prevent deleting clients with active invoices
- Uniqueness validations (email, document)

✅ **Deliverable:** User can manage clients and link them to invoices.

📊 **Completion Criteria:**
- Client CRUD works
- Invoice ↔ Client relationship works
- Cannot delete client with invoices
- Client picker works in invoice form
- Validations prevent duplicates

---

## 📦 PHASE 5: Products

### 5️⃣ Products Management  
**Goal:** Product catalog + line items in invoices.

#### Data Layer
- Product schema (WatermelonDB + Supabase)
- InvoiceLineItem schema (many-to-many)
- Models with validations
- RLS policies
- Migrations

#### UI
- Product list
- Product CRUD
- Product picker in invoice form
- Line items table in invoice
- Automatic calculations (subtotal, tax, total)

#### Business Logic
- Totals calculation from line items
- Tax calculations
- Discount logic (if applicable)

✅ **Deliverable:** User creates invoices with multiple products and automatic totals.

📊 **Completion Criteria:**
- Product CRUD works
- Invoice line items work
- Automatic totals are correct
- Can add/remove line items
- Total recalculates automatically

---

## 📊 PHASE 6: Analytics (Basic)

### 6️⃣ Dashboard & Analytics  
**Goal:** Dashboards and insights about the business.

#### Data Aggregation
- Aggregated queries (totals, averages)
- Period filters
- Breakdown by status
- Top clients
- Revenue over time

#### UI
- Dashboard home
- Charts (react-native-chart-kit or recharts)
- KPI cards
- Export reports (CSV/PDF)

#### Performance
- Cache aggregated queries
- Background calculation if needed

✅ **Deliverable:** User sees business overview, charts, KPIs.

📊 **Completion Criteria:**
- Dashboard loads in <2s
- Charts render correctly
- Period filters work
- CSV export works
- Aggregated data is correct

---

## 🔔 PHASE 7: Notifications & Reminders

### 7️⃣ Notifications & Alerts  
**Goal:** Push notifications and reminders.

#### Push Notifications
- Expo Notifications setup
- FCM integration
- Token management
- Server push (Supabase Edge Functions)

#### Use Cases
- Invoice due reminder
- Sync error notification
- Payment received notification (future webhook)

#### Permissions
- Request notification permission
- Settings to control notifications

✅ **Deliverable:** User receives important reminders.

📊 **Completion Criteria:**
- Push notifications reach iOS
- Push notifications reach Android
- User can disable notifications
- Reminders are sent on time
- Tapping a notification opens the correct screen

---

## 🌍 PHASE 8: Internationalization

### 8️⃣ Multi-language (i18n)  
**Goal:** Support multiple languages.

#### i18n Setup
- i18next configured
- Translation file structure
- Extract hardcoded strings
- Language picker in UI

#### Translations
- Portuguese (BR) — primary
- English (US) — secondary
- Number/date/currency formatting by locale

✅ **Deliverable:** App works in PT-BR and EN-US.

📊 **Completion Criteria:**
- Fully translated in PT-BR
- Fully translated in EN-US
- Numbers formatted correctly per locale
- Dates formatted correctly
- Currency formatted correctly
- Language switching works without restart

---

## 📱 PHASE 9: Mobile Polish

### 9️⃣ Reports & Exports  
**Goal:** Mobile-specific improvements.

#### Mobile UX
- Gestures (swipe to delete, pull to refresh)
- Haptic feedback
- Bottom sheets for modals
- Floating Action Buttons
- Improved tab navigation

#### Features
- Share invoice (share PDF/link)
- Camera to attach photos (future)
- Biometric auth (FaceID/TouchID)
- Improved offline banner

#### Performance
- FlashList for large lists
- Image optimization
- Bundle size optimization

✅ **Deliverable:** Polished and native mobile experience.

📊 **Completion Criteria:**
- Gestures feel intuitive
- Haptics on key actions
- Biometric auth works
- Share works (iOS + Android)
- 60fps performance on lists

---

## 🌐 PHASE 10: Web Optimization

### 🔟 Advanced Settings & Preferences — Invoice Management System  
**Goal:** First-class web experience.

#### Web-specific
- Refined responsive design
- Keyboard shortcuts
- Sidebar navigation (desktop)
- Bulk actions (multi-select)
- Advanced filters

#### PWA
- Service worker
- Manifest.json
- Install prompt
- Offline fallback page

#### SEO (if applicable)
- Meta tags
- Sitemap
- Open Graph tags

✅ **Deliverable:** Web app with desktop-first UX, installable as PWA.

📊 **Completion Criteria:**
- Responsive across breakpoints
- PWA installable
- Keyboard shortcuts work
- Lighthouse score > 90
- Offline fallback works

---

## 🪟 PHASE 11: Windows Desktop

### 1️⃣1️⃣ Data Security & Privacy — Invoice Management System  
**Goal:** Native desktop app.

#### Setup
- react-native-windows app
- Shared core packages
- Windows-specific UI adaptations

#### Features
- Tray icon
- Desktop notifications
- Auto-update
- Deep linking

✅ **Deliverable:** Installable native Windows app.

📊 **Completion Criteria:**
- Installer works
- App starts without errors
- Sync works
- UI adapted for desktop
- Auto-update works

---

## 🚀 PHASE 12: Advanced Features

### 1️⃣2️⃣ Performance Optimization & Monitoring — Invoice Management System  
**Goal:** Differentiating features.

#### NF-e Integration (Brazil)
- Integrate with fiscal API (e.g., eNotas, NFe.io)
- Issue NF-e
- Store XMLs
- Validate fiscal data

#### Payments
- Payment webhooks (Stripe, PayPal, PagSeguro)
- Mark invoice as "Paid"
- Payment history

#### Recurrence
- Recurring invoices (monthly, yearly)
- Invoice templates
- Auto-send

#### Collaboration
- Invite members to tenant
- Activity log (who did what)
- Comments on invoices

✅ **Deliverable:** Premium features that add real value.

📊 **Completion Criteria:**
- NF-e issued correctly
- Webhooks process payments
- Recurring invoices work
- Collaboration works (multi-user)

---

## 🎨 PHASE 13: Design & UX Refinement

**Goal:** Final UX/UI polish.

#### Design System Maturity
- All components documented
- Full variants
- Full accessibility audit
- Consistent animation library

#### Onboarding
- First-time user tutorial
- Empty states with clear CTAs
- Contextual tooltips

#### Micro-interactions
- Polished loading states
- Success animations
- Improved error feedback
- Skeleton screens

✅ **Deliverable:** Visually polished, easy-to-use app.

📊 **Completion Criteria:**
- Design system 100% documented
- Onboarding complete
- Accessibility score > 95
- Smooth animations (60fps)
- Positive user testing

---

## 🔧 PHASE 14: DevOps & Monitoring

**Goal:** Observability and reliability in production.

#### Monitoring
- Observability dashboards
- Alerts configured
- Active performance monitoring
- Error grouping and prioritization

#### Reliability
- Health checks
- Uptime monitoring
- Automatic backups (Supabase)
- Disaster recovery plan

#### Analytics
- Product analytics (PostHog, Mixpanel)
- Feature adoption tracking
- User journey funnels

✅ **Deliverable:** Full production visibility and automated alerts.

📊 **Completion Criteria:**
- Alerts work (email/Slack)
- Dashboards accessible
- Uptime > 99.5%
- Automatic backup tested
- DR plan documented

---

## 📚 PHASE 15: Documentation & Launch Prep

**Goal:** Complete documentation and launch readiness.

#### Documentation
- Complete README
- API documentation
- Key ADRs documented
- Operational runbooks
- User documentation / Help Center

#### Compliance
- LGPD compliance review
- Privacy Policy
- Terms of Service
- Data retention policies

#### Launch
- Beta testing (internal)
- Beta testing (external — early users)
- Performance benchmarks validated
- External security audit (if budget allows)

✅ **Deliverable:** Ready for public launch.

📊 **Completion Criteria:**
- Documentation complete
- Compliance verified
- Beta feedback incorporated
- Performance validated
- Security audit passed (if performed)

---

## 📈 Key Milestones

### Milestone 1: Technical Foundation ✅
Phases 0–2
- Infrastructure ready
- Auth working
- Offline-first validated

### Milestone 2: MVP ✅
Phases 3–5
- Invoices, Clients, Products working
- Ready to validate with early adopters

### Milestone 3: V1 Complete ✅
Phases 6–8
- Analytics, Notifications, i18n
- Complete, usable product

### Milestone 4: Production Ready ✅
Phases 9–15
- Polish, Advanced Features, Monitoring
- Ready to scale

---

## 🔄 Validation Process Between Phases

After each phase:

1. Internal demo (team + stakeholders)
2. QA testing (manual + automated)
3. Deploy to staging
4. User testing (if applicable)
5. Retrospective (what worked, what to improve)
6. Decision: proceed or iterate?

---

## 📊 Success Metrics

### Technical
- CI passes 100%
- Test coverage > 80%
- Performance: Lighthouse > 90
- Production bugs < 5/week
- Uptime > 99.5%

### Product
- Time to value < 5 min (onboarding)
- DAU/MAU ratio > 30%
- Feature adoption > 60%
- NPS > 50

### Business
- Churn < 5%
- Customer acquisition cost validated
- Revenue growth (if applicable)

---

## 🎯 Next Steps

1. Review roadmap with team and stakeholders
2. Prioritize phases based on business goals
3. Estimate effort per phase (story points or time)
4. Define sprints (recommended: 2 weeks)
5. Start Phase 0 🚀

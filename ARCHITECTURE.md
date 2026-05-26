# Metriva Homes — Production Architecture

> **Metriva Technologies** | India's Next-Generation AI-Powered Real Estate Ecosystem

---

## Table of Contents

1. [Vision & Competitive Strategy](#1-vision--competitive-strategy)
2. [Architecture Philosophy](#2-architecture-philosophy)
3. [Tech Stack Decisions](#3-tech-stack-decisions)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Monorepo Structure](#5-monorepo-structure)
6. [Backend Architecture (NestJS)](#6-backend-architecture-nestjs)
7. [Frontend Architecture (React + Vite)](#7-frontend-architecture-react--vite)
8. [Mobile Architecture (React Native + Expo)](#8-mobile-architecture-react-native--expo)
9. [Database Design](#9-database-design)
10. [API Structure](#10-api-structure)
11. [Authentication Flow](#11-authentication-flow)
12. [AI Integration Architecture](#12-ai-integration-architecture)
13. [Security Architecture](#13-security-architecture)
14. [Payment Architecture](#14-payment-architecture)
15. [Cost Optimization Strategy](#15-cost-optimization-strategy)
16. [MVP Roadmap](#16-mvp-roadmap)
17. [Deployment Strategy](#17-deployment-strategy)
18. [Scaling Strategy](#18-scaling-strategy)
19. [Recommended SaaS Tools & Costs](#19-recommended-saas-tools--costs)

---

## 1. Vision & Competitive Strategy

### Why Metriva Can Win

| Competitor | Weakness | Metriva Advantage |
|---|---|---|
| MagicBricks / 99acres | Fake listings, zero trust | AI trust score + verified owner badge |
| NoBroker | UI/UX dated, limited AI | Modern UX + AI fraud detection |
| Housing.com | Expensive leads, broker-heavy | Transparent pricing, direct seller tools |
| Zillow (US) | Not India-specific | Deep India locality intelligence |

### Core Differentiators
- **Trust Infrastructure**: Every listing gets an AI-generated Trust Score (0–100)
- **Fraud Detection**: Multi-signal ML pipeline catches duplicate/fake listings pre-publish
- **Locality Intelligence**: AI-generated hyperlocal insights (connectivity, growth, livability)
- **Verified Badges**: RERA-verified builders, KYC'd brokers, document-checked sellers
- **Zero Dark Patterns**: Transparent pricing, no hidden broker fees without consent

---

## 2. Architecture Philosophy

### Modular Monolith (not Microservices — yet)

**Why not microservices on Day 1?**
- Solo founder → microservices = 10x ops overhead for 0x user benefit
- Monolith deployed on Railway/Render = $0–$20/month vs $200+/month K8s
- NestJS modules = clean separation that CAN split into services later
- PostgreSQL single DB = simpler transactions, joins, no distributed saga complexity

**When to split?**
- When a single module is getting >100 RPS sustained
- When the AI module needs GPU inference (split to dedicated service)
- When team > 5 engineers (cognitive load per module)

### Design Principles
- **Lean first**: No service you don't need today
- **Schema-driven**: Prisma types flow end-to-end to frontend
- **Security by default**: Auth, RBAC, validation on every endpoint
- **AI-augmented**: Every property event triggers AI scoring asynchronously
- **Audit everything**: Every state change logged for fraud investigation

---

## 3. Tech Stack Decisions

### Backend — NestJS + TypeScript

**Why NestJS over Express/Fastify bare?**
- Built-in DI container → testable, modular, scalable
- Decorator-based → auth guards, validation pipes, interceptors without boilerplate
- First-class TypeScript → end-to-end type safety with Prisma
- Guards + Interceptors → security layer is architectural, not bolted-on
- Active ecosystem: Passport, Swagger, Bull queues, CQRS — all first-class

**Why not:** Go (Gin/Fiber) — excellent performance, but TypeScript full-stack = shared types with frontend, faster solo iteration.

### Database — PostgreSQL + Prisma

**Why PostgreSQL?**
- PostGIS extension for geospatial queries (nearby properties by lat/lng)
- Full-text search with `tsvector` (avoid Elasticsearch at MVP)
- JSONB for flexible AI signal storage
- Mature, battle-tested at scale

**Why Prisma over TypeORM/Drizzle?**
- Generated client = zero runtime query errors
- Intuitive schema → perfect for iterations
- Drizzle is faster but less ergonomic for rapid prototyping
- Migrate to Drizzle if raw performance is critical at scale

### Auth — Supabase Auth initially

**Why Supabase?**
- Row Level Security built-in
- Google OAuth, email/password, OTP out-of-the-box  
- Free tier: 50,000 MAU
- Can migrate to self-hosted Keycloak or custom JWT later

### Frontend — React + Vite + TailwindCSS + shadcn/ui

**Why Vite over CRA/Next.js?**
- Vite: fastest HMR, SPA for now (add SSR/Next.js when SEO is critical priority)
- Next.js adds complexity (server components, app router) — worth it at scale for SEO
- **Migrate path**: Replace Vite SPA with Next.js App Router when organic search matters

**Why shadcn/ui over MUI/Chakra?**
- Copy-paste components = full ownership, no bundle overhead
- Radix UI primitives = WAI-ARIA compliant accessibility
- Tailwind-native = consistent with design system

### Mobile — React Native + Expo

**Why Expo over bare RN?**
- Managed workflow: OTA updates (Expo Updates), no Xcode/Gradle hell on Day 1
- EAS Build: Cloud builds for both platforms
- Expo Router: File-based navigation (Next.js-like)
- **Eject path**: When you need custom native modules (real-time video tours, AR), eject to bare

**Why not Flutter?**
- TypeScript team = shared business logic types, hooks, API client
- React Native = same mental model as web team

### AI — OpenAI + Groq

**Why both?**
- OpenAI GPT-4o: Complex analysis (fraud detection, document verification, trust scoring)
- Groq (LLaMA 3.1): Fast, cheap summarization (property descriptions, locality insights)
- Groq = ~10x faster inference, ~10x cheaper for simple tasks
- Fallback: if Groq fails → OpenAI; if OpenAI is expensive → Groq

### Storage — Cloudflare R2

**Why R2 over S3?**
- **Zero egress fees** (S3 charges ~$0.09/GB egress — real estate = lots of images)
- S3-compatible API → swap with no code changes
- Cloudflare CDN included
- 10GB free storage forever

### Deployment — Railway (API) + Vercel (Web)

**Why Railway over AWS/GCP?**
- $0/month (Hobby) → $20/month (Pro) = production-grade Postgres + Redis + API
- GitHub-native CI/CD: push to main = deployed in 2 min
- Postgres + Redis included: no separate RDS ($40+/month) or ElastiCache

**Why Vercel for web?**
- Zero config React/Next deployment
- Global CDN, preview deployments per PR
- Free tier: 100GB bandwidth/month

**Total startup infra cost: $0–$50/month for first 10K users**

---

## 4. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTS                                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │   Web App        │  │   Mobile App     │  │  Admin Panel   │  │
│  │  React + Vite    │  │  Expo + RN       │  │  React + Vite  │  │
│  │  Vercel CDN      │  │  iOS + Android   │  │  /admin route  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │ HTTPS + JWT
                    ┌────────────▼─────────────┐
                    │     Cloudflare WAF / CDN  │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼──────────────────────────────────┐
                    │         NestJS API (Railway)                    │
                    │                                                 │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
                    │  │   Auth   │ │Properties│ │    Search     │  │
                    │  │  Module  │ │  Module  │ │   Module      │  │
                    │  └──────────┘ └──────────┘ └──────────────┘  │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
                    │  │    AI    │ │ Payments │ │Notifications  │  │
                    │  │  Module  │ │  Module  │ │   Module      │  │
                    │  └──────────┘ └──────────┘ └──────────────┘  │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
                    │  │  Users   │ │  Fraud   │ │    Admin      │  │
                    │  │  Module  │ │  Module  │ │   Module      │  │
                    │  └──────────┘ └──────────┘ └──────────────┘  │
                    └───────┬──────────────────────────┬────────────┘
                            │                          │
               ┌────────────▼──────┐      ┌───────────▼──────────┐
               │  PostgreSQL        │      │   Redis              │
               │  (Supabase)        │      │   (Upstash/Railway)  │
               │  Primary Store     │      │   Cache + Rate Limit │
               └───────────────────┘      └──────────────────────┘

EXTERNAL SERVICES:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ OpenAI   │ │  Groq    │ │Razorpay  │ │ Resend   │ │ Firebase │
│ GPT-4o   │ │LLaMA 3.1 │ │Payments  │ │  Email   │ │   FCM    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Mapbox   │ │Cloudflare│ │ PostHog  │ │  Sentry  │
│  Maps    │ │    R2    │ │Analytics │ │  Errors  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## 5. Monorepo Structure

```
metriva-homes/                          # Turborepo Monorepo
├── apps/
│   ├── api/                            # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/               # JWT, OAuth, OTP
│   │   │   │   ├── users/              # User profiles, KYC
│   │   │   │   ├── properties/         # CRUD, media upload
│   │   │   │   ├── search/             # Filters, geo-search
│   │   │   │   ├── ai/                 # Trust score, fraud, summaries
│   │   │   │   ├── payments/           # Razorpay integration
│   │   │   │   ├── notifications/      # FCM + Resend
│   │   │   │   ├── admin/              # Moderation dashboard
│   │   │   │   ├── brokers/            # Broker profiles
│   │   │   │   ├── builders/           # Builder profiles, projects
│   │   │   │   ├── fraud/              # Fraud reports
│   │   │   │   ├── localities/         # Locality data + AI insights
│   │   │   │   └── prisma/             # Prisma service
│   │   │   ├── common/
│   │   │   │   ├── decorators/         # @CurrentUser, @Roles, @Public
│   │   │   │   ├── filters/            # Global exception filter
│   │   │   │   ├── guards/             # JwtAuth, Roles, Throttle
│   │   │   │   ├── interceptors/       # Logging, Transform, Cache
│   │   │   │   ├── middleware/         # Request ID, audit logger
│   │   │   │   └── pipes/              # Validation, ParseObjectId
│   │   │   ├── config/                 # Typed env config
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Full DB schema
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web/                            # React + Vite Frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Home/
│   │   │   │   ├── Properties/
│   │   │   │   ├── PropertyDetail/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Dashboard/
│   │   │   │   └── Admin/
│   │   │   ├── components/
│   │   │   │   ├── ui/                 # shadcn/ui components
│   │   │   │   ├── Layout/             # Header, Footer, Sidebar
│   │   │   │   ├── Property/           # Cards, Search, Filters, Map
│   │   │   │   ├── Trust/              # TrustScore, VerifiedBadge
│   │   │   │   └── AI/                 # AI insights display
│   │   │   ├── hooks/                  # useAuth, useProperties, useSearch
│   │   │   ├── store/                  # Zustand stores
│   │   │   ├── lib/                    # API client, queryClient
│   │   │   ├── router/                 # React Router v6 setup
│   │   │   ├── types/                  # Local type extensions
│   │   │   └── utils/                  # formatPrice, formatArea, etc.
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                         # React Native + Expo
│       ├── src/
│       │   ├── navigation/
│       │   │   ├── index.tsx           # Root navigator
│       │   │   ├── AuthNavigator.tsx   # Login, Register, OTP
│       │   │   ├── MainNavigator.tsx   # Bottom tabs
│       │   │   └── types.ts            # Navigation param lists
│       │   ├── screens/
│       │   │   ├── Home/
│       │   │   ├── Search/
│       │   │   ├── PropertyDetail/
│       │   │   ├── Saved/
│       │   │   ├── Profile/
│       │   │   └── Auth/
│       │   ├── components/
│       │   │   ├── PropertyCard.tsx
│       │   │   ├── TrustBadge.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   └── MapView.tsx
│       │   ├── hooks/
│       │   ├── store/                  # Zustand + MMKV persist
│       │   ├── lib/                    # API client (shared with web)
│       │   └── utils/
│       ├── assets/
│       ├── App.tsx
│       ├── app.json
│       ├── tsconfig.json
│       ├── babel.config.js
│       └── package.json
│
├── packages/
│   ├── shared/                         # Shared types + utils
│   │   ├── src/
│   │   │   ├── types/                  # All shared TypeScript types
│   │   │   ├── constants/              # Enums, config constants
│   │   │   └── utils/                  # Price formatter, validators
│   │   └── package.json
│   │
│   └── config/                         # Shared ESLint, TS configs
│       ├── eslint/
│       ├── typescript/
│       └── package.json
│
├── infrastructure/
│   ├── docker/
│   └── scripts/                        # DB backup, health check
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Lint, test, type-check
│       ├── deploy-api.yml              # Deploy to Railway
│       └── deploy-web.yml              # Deploy to Vercel
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── .env.example
└── ARCHITECTURE.md
```

---

## 6. Backend Architecture (NestJS)

### Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── PrismaModule (global)
├── CacheModule (Redis, global)
├── ThrottlerModule (rate limiting)
│
├── AuthModule
│   ├── JwtStrategy
│   ├── GoogleStrategy
│   ├── PassportModule
│   └── → UsersModule
│
├── UsersModule
├── PropertiesModule
│   └── → AiModule (async scoring on create/update)
│
├── SearchModule
│   └── → LocalitiesModule
│
├── AiModule
│   ├── OpenAI service
│   ├── Groq service
│   └── → FraudModule
│
├── FraudModule
├── PaymentsModule (Razorpay)
├── NotificationsModule (FCM + Resend)
├── BrokersModule
├── BuildersModule
├── LocalitiesModule
└── AdminModule
```

### Request Lifecycle

```
Request
  → Cloudflare (DDoS, WAF)
  → Helmet (security headers)
  → CORS
  → ThrottlerGuard (rate limiting via Redis)
  → RequestIdMiddleware (x-request-id)
  → JwtAuthGuard (verify token, attach user)
  → RolesGuard (RBAC check)
  → ValidationPipe (DTO validation via class-validator)
  → Controller method
  → Service layer (business logic)
  → Prisma (DB query)
  → TransformInterceptor (standardize response)
  → LoggingInterceptor (audit trail)
Response
```

### Response Format (all endpoints)

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }  // paginated
}

// Error
{
  "success": false,
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "Property with id xyz not found",
    "statusCode": 404
  }
}
```

---

## 7. Frontend Architecture (React + Vite)

### State Management Strategy

| State Type | Solution | Why |
|---|---|---|
| Server state | React Query | Caching, refetch, mutations, pagination |
| Global UI state | Zustand | Auth, theme, search filters — lightweight |
| URL state | React Router search params | Shareable filter URLs |
| Form state | React Hook Form | Performance, validation |
| Local UI state | useState/useReducer | Modal open/close, etc. |

### Route Structure

```
/                           → Home (featured, trending)
/properties                 → Search results
/properties/:id             → Property detail + AI trust score
/properties/map             → Map view search
/auth/login                 → Login
/auth/register              → Register
/auth/verify-email          → Email verification
/auth/forgot-password       → Password reset
/dashboard                  → User dashboard
/dashboard/properties       → My listings
/dashboard/saved            → Saved properties
/dashboard/alerts           → Search alerts
/dashboard/payments         → Payment history
/post-property              → Create listing
/broker/:id                 → Broker profile
/builder/:id                → Builder profile
/locality/:slug             → Locality insights
/admin/*                    → Admin panel (role-gated)
```

### Code Splitting Strategy

```typescript
// All routes are lazy-loaded
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
// Bundle analysis target: initial chunk < 150KB gzipped
```

---

## 8. Mobile Architecture (React Native + Expo)

### Navigation Structure

```
RootNavigator
├── AuthNavigator (Stack)
│   ├── OnboardingScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── OtpScreen
│
└── MainNavigator (Bottom Tabs)
    ├── HomeStack
    │   ├── HomeScreen
    │   └── PropertyDetailScreen
    ├── SearchStack
    │   ├── SearchScreen (map + list toggle)
    │   └── FiltersScreen
    ├── PostStack
    │   └── PostPropertyScreen
    ├── SavedStack
    │   └── SavedScreen
    └── ProfileStack
        ├── ProfileScreen
        ├── MyListingsScreen
        └── SettingsScreen
```

### Offline-First Strategy

- MMKV for persistent storage (10x faster than AsyncStorage)
- React Query with `staleTime: 5 * 60 * 1000` for cached responses
- Optimistic updates for save/unsave property
- Expo Updates for OTA patches without App Store approval

---

## 9. Database Design

### Entity Relationship Summary

```
User ──1:1──► Broker
User ──1:1──► Builder
User ──1:N──► Property (owner)
User ──1:N──► SavedProperty
User ──1:N──► Payment
User ──1:1──► Subscription
User ──1:N──► FraudReport (reporter)
User ──1:N──► Notification
User ──1:N──► SearchAlert
User ──1:N──► AuditLog

Property ──1:N──► PropertyImage
Property ──1:1──► AiScore
Property ──1:N──► FraudReport
Property ──1:N──► Review
Property ──N:1──► Locality
Property ──N:1──► Broker (optional)
Property ──N:1──► Builder (optional)
Property ──N:1──► Project (optional)

Builder ──1:N──► Project
Project ──1:N──► Property

Subscription ──1:N──► Payment
```

### Key Indexes for Performance

```sql
-- Most frequent search query
CREATE INDEX idx_property_search ON properties(city, listing_type, type, status);
-- Geo search
CREATE INDEX idx_property_geo ON properties USING GIST(ST_MakePoint(lng, lat));
-- Featured listings
CREATE INDEX idx_property_featured ON properties(is_featured, featured_till) WHERE is_featured = true;
-- Price range filter
CREATE INDEX idx_property_price ON properties(price) WHERE status = 'ACTIVE';
-- Full-text search
CREATE INDEX idx_property_fts ON properties USING GIN(to_tsvector('english', title || ' ' || description));
```

### Performance Targets

| Query | Target P99 |
|---|---|
| Property search (city + filters) | < 100ms |
| Property detail | < 50ms |
| Geo-radius search | < 150ms |
| User dashboard | < 80ms |

---

## 10. API Structure

### RESTful Endpoint Map

```
# Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/google
GET    /api/auth/google/callback
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email

# Properties
GET    /api/properties              # search + filter + pagination
POST   /api/properties              # create listing (auth)
GET    /api/properties/featured     # featured listings (public)
GET    /api/properties/nearby       # geo-radius search
GET    /api/properties/:id          # property detail
PATCH  /api/properties/:id          # update (owner/admin)
DELETE /api/properties/:id          # soft delete (owner/admin)
POST   /api/properties/:id/images   # upload images (multipart)
DELETE /api/properties/:id/images/:imageId
POST   /api/properties/:id/feature  # pay to feature

# Saved Properties
GET    /api/saved                   # my saved list
POST   /api/saved/:propertyId       # save/unsave toggle
DELETE /api/saved/:propertyId

# Search
GET    /api/search                  # unified search (properties + localities)
GET    /api/search/suggestions      # autocomplete

# AI
GET    /api/ai/trust-score/:propertyId
POST   /api/ai/analyze-property     # manual trigger
GET    /api/ai/locality-insights/:localityId
POST   /api/ai/check-duplicate      # check before publish

# Localities
GET    /api/localities              # list
GET    /api/localities/:id          # detail + AI insights

# Fraud
POST   /api/fraud/report            # report a listing
GET    /api/fraud/reports           # admin only

# Users
GET    /api/users/me
PATCH  /api/users/me
GET    /api/users/:id/public        # public profile

# Brokers
GET    /api/brokers
GET    /api/brokers/:id
PATCH  /api/brokers/profile         # update own profile

# Builders
GET    /api/builders
GET    /api/builders/:id
GET    /api/builders/:id/projects

# Payments
POST   /api/payments/create-order   # Razorpay order
POST   /api/payments/verify         # verify payment signature
GET    /api/payments/history

# Subscriptions
GET    /api/subscriptions/plans
POST   /api/subscriptions/subscribe
GET    /api/subscriptions/current

# Notifications
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/mark-all-read
POST   /api/notifications/fcm-token

# Search Alerts
GET    /api/alerts
POST   /api/alerts
PATCH  /api/alerts/:id
DELETE /api/alerts/:id

# Admin
GET    /api/admin/dashboard         # stats overview
GET    /api/admin/properties        # pending review
PATCH  /api/admin/properties/:id/approve
PATCH  /api/admin/properties/:id/reject
GET    /api/admin/users
PATCH  /api/admin/users/:id/suspend
GET    /api/admin/fraud-reports
PATCH  /api/admin/fraud-reports/:id/resolve
```

---

## 11. Authentication Flow

### Multi-Strategy Auth

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Strategies                     │
│                                                                   │
│  1. Email + Password                                              │
│     → bcrypt hash, JWT access (15m) + refresh (7d) in httpOnly   │
│                                                                   │
│  2. Google OAuth 2.0                                              │
│     → Passport Google Strategy → upsert user → JWT pair          │
│                                                                   │
│  3. Phone OTP                                                     │
│     → MSG91 send OTP → store hash in Redis (5min TTL)            │
│     → verify → JWT pair                                           │
│                                                                   │
│  4. Token Refresh                                                 │
│     → POST /auth/refresh with httpOnly refresh cookie            │
│     → validate hash in DB → issue new access token               │
└─────────────────────────────────────────────────────────────────┘

JWT Access Token Payload:
{
  sub: "user_id",
  email: "user@email.com",
  role: "BUYER",
  iat: 1234567890,
  exp: 1234568790   // 15 minutes
}

Security measures:
- Access token: 15 minute expiry, stored in memory (Zustand)
- Refresh token: 7 day expiry, httpOnly Secure SameSite cookie
- Refresh token hash stored in DB (revocable)
- Logout: delete refresh token from DB + clear cookie
- Rotation: new refresh token on every refresh
```

---

## 12. AI Integration Architecture

### Property Trust Score Pipeline

```
Property Created/Updated
        │
        ▼
[Queue: ai_score_job]  ← BullMQ (Redis-backed)
        │
        ▼
AI Module picks up job
        │
        ├── Signal 1: Content Quality Check (Groq/LLaMA)
        │   - Description completeness
        │   - Image count, quality flags
        │   - Title relevance
        │
        ├── Signal 2: Fraud Risk Analysis (OpenAI GPT-4o)
        │   - Duplicate detection (embedding similarity)
        │   - Price anomaly (vs locality avg)
        │   - Phone number patterns
        │   - Description plagiarism
        │
        ├── Signal 3: Document Verification Score
        │   - Title deed uploaded?
        │   - RERA registration?
        │   - Owner KYC verified?
        │
        ├── Signal 4: Seller Trust Score
        │   - Seller history on platform
        │   - Past fraud flags
        │   - Account age + activity
        │
        └── Final Trust Score (0–100)
            - Store in AiScore table
            - Update property.aiTrustScore
            - Trigger notification if score < 40 (review needed)

Score Interpretation:
  80–100: ✅ Highly Trusted (green badge)
  60–79:  🟡 Likely Legitimate (yellow)
  40–59:  🟠 Needs Review (orange)
  0–39:   🔴 High Risk (flagged for admin review)
```

### AI Locality Insights

```
GET /api/ai/locality-insights/:id
        │
        ├── Check cache (Redis, 24h TTL)
        │
        ├── If miss → Groq LLaMA 3.1 prompt:
        │   - Locality demographics, connectivity
        │   - Average price trends
        │   - Nearby amenities (schools, hospitals, metro)
        │   - Growth potential (infrastructure projects)
        │
        └── Store in localities.aiInsights + localities.aiInsightsAt
```

### AI-Generated Property Summary

```
On property creation (async):
  → Groq: "Write a compelling, factual property description
           based on: {bedrooms}, {area}, {amenities}, {location}
           in 150 words. Focus on lifestyle benefits."
  → Store in property.aiSummary
  → Show on detail page as "AI Summary" (user can edit own description separately)
```

### Duplicate Detection

```
On property publish:
  → Generate embedding: OpenAI text-embedding-3-small
  → Query: SELECT id FROM properties WHERE
           embedding <-> {new_embedding} < 0.15
           AND city = ? AND listing_type = ?
           AND ABS(price - ?) / ? < 0.2
           ORDER BY embedding <-> {new_embedding} LIMIT 5
  → If match found: flag as potential duplicate, hold for admin review
  → Use pgvector extension for efficient similarity search
```

---

## 13. Security Architecture

### Layers of Defense

```
Layer 1: Infrastructure
  - Cloudflare proxied (hides origin IP, DDoS protection)
  - Railway private networking (DB not exposed to internet)

Layer 2: Transport
  - HTTPS enforced (HSTS preloaded)
  - Helmet.js (X-Frame-Options, CSP, HSTS)
  - CORS: whitelist only known origins

Layer 3: Authentication
  - JWT RS256 (asymmetric) or HS256 (symmetric) — start with HS256
  - Short-lived access tokens (15m)
  - Refresh token rotation (detect reuse = revoke all)
  - httpOnly Secure SameSite=Strict cookies for refresh token

Layer 4: Authorization
  - Role-Based Access Control (BUYER < SELLER < BROKER < BUILDER < ADMIN)
  - Resource-level ownership check (can only edit own property)
  - Row Level Security in Supabase as backup

Layer 5: Input Validation
  - class-validator + class-transformer on all DTOs
  - Zod on frontend forms
  - File upload: type check (magic bytes), size limit (10MB), virus scan (ClamAV optional)

Layer 6: Rate Limiting
  - Global: 100 req/15min per IP
  - Auth endpoints: 10 req/15min per IP
  - OTP: 3 sends/hour per phone number
  - AI endpoints: 20 req/hour per user

Layer 7: Audit Logging
  - Every write operation logged to AuditLog table
  - IP, user agent, before/after state captured
  - Critical events: login, logout, property post, payment, fraud report

Layer 8: XSS/CSRF
  - CSP headers via Helmet
  - Sanitize user-generated content (DOMPurify on frontend)
  - API is JSON-only (no form submissions = no CSRF risk for API)
  - CSRF token for cookie-based flows
```

---

## 14. Payment Architecture

### Razorpay Integration Flow

```
User clicks "Feature My Listing (₹999/month)"
        │
        ▼
POST /api/payments/create-order
  → server creates Razorpay order (server-side)
  → returns { orderId, amount, currency, key }
        │
        ▼
Frontend: Razorpay.open({ orderId, ... })
  → User pays in Razorpay modal
  → On success: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        │
        ▼
POST /api/payments/verify
  → HMAC-SHA256 signature verification (server-side)
  → Update payment status in DB
  → Trigger feature activation
  → Send confirmation email + push notification

Webhook backup: Razorpay → /api/payments/webhook
  → Verify webhook signature
  → Handle payment.captured, payment.failed, refund.created
```

---

## 15. Cost Optimization Strategy

### Monthly Infra Cost at Different Scales

| Scale | Users/month | Infra Cost | Notes |
|---|---|---|---|
| MVP | 0–1,000 | $0–$15 | Railway Hobby + Vercel free + Supabase free |
| Growth | 1K–10K | $20–$50 | Railway Pro ($20) + Supabase free ($0) |
| Scale | 10K–100K | $80–$150 | Railway Pro + Upstash Redis + Supabase Pro ($25) |
| Hyper | 100K+ | $300–$800 | Consider AWS, self-host Postgres, add read replicas |

### Key Savings

1. **Cloudflare R2** vs S3: $0 egress (S3 = $0.09/GB → saves $100s/month at scale)
2. **Groq for AI**: $0.05/1M tokens vs OpenAI $5/1M → 100x cheaper for summaries
3. **Railway vs AWS**: $20/month vs $200+/month for comparable setup
4. **Resend email**: 3,000 free emails/month vs SendGrid $15/month minimum
5. **PostHog**: 1M events free vs Mixpanel $24+/month
6. **Supabase**: 500MB DB + 50K MAU free vs RDS $15+/month

---

## 16. MVP Roadmap

### Phase 1 — Foundation (Weeks 1–4)

- [ ] Auth system (email + Google + OTP)
- [ ] Property CRUD with image upload
- [ ] Basic search with city + type + price filters
- [ ] Property detail page
- [ ] Basic AI trust score (simple heuristics first, upgrade to GPT later)
- [ ] Admin dashboard (approve/reject listings)

### Phase 2 — Trust & Discovery (Weeks 5–8)

- [ ] AI fraud detection pipeline
- [ ] Verified owner badge flow
- [ ] Map-based search (Mapbox)
- [ ] Save properties + search alerts
- [ ] Broker/Builder profiles
- [ ] Email notifications (Resend)

### Phase 3 — Monetization (Weeks 9–12)

- [ ] Razorpay integration (featured listings)
- [ ] Subscription plans (basic/professional)
- [ ] Push notifications (Firebase)
- [ ] Mobile app MVP
- [ ] Locality AI insights
- [ ] Review & rating system

### Phase 4 — Scale (Months 4–6)

- [ ] Advanced duplicate detection (pgvector embeddings)
- [ ] AI property summaries (auto-generated)
- [ ] Nearby search with PostGIS
- [ ] Analytics dashboard for sellers
- [ ] WhatsApp notification integration
- [ ] SEO-optimized property pages (Next.js migration)

---

## 17. Deployment Strategy

### Development → Production Pipeline

```
Developer pushes to feature branch
        │
        ▼
GitHub Actions CI:
  - npm run lint
  - npm run type-check
  - npm run test
  - npm run build
        │
        ▼
PR review + merge to main
        │
        ├── Vercel: Auto-deploys web app (< 2 min)
        │
        └── Railway: Auto-deploys API (< 3 min)
                │
                └── post-deploy: prisma migrate deploy (zero-downtime)
```

### Environment Strategy

| Environment | Branch | API | Web | DB |
|---|---|---|---|---|
| Development | local | localhost:3001 | localhost:5173 | Docker Postgres |
| Staging | develop | staging-api.railway.app | staging.vercel.app | Supabase staging |
| Production | main | api.metrivahomes.com | metrivahomes.com | Supabase production |

### Zero-Downtime Deployments

- Railway: rolling deploy (old pod stays up until new is healthy)
- Prisma migrations: additive only (never delete columns — rename then backfill)
- Feature flags: use PostHog feature flags for risky releases

---

## 18. Scaling Strategy

### When you hit 100K+ users

```
Phase 1: Vertical + DB Optimization (0→50K)
  - Increase Railway plan (more CPU/RAM)
  - Add DB indexes based on slow query log
  - Redis caching for hot data (featured listings, locality insights)
  - Cloudflare cache rules for public property pages

Phase 2: Read Replicas + CDN (50K→200K)
  - Supabase read replicas for search queries
  - Next.js SSG/ISR for property pages (SEO + performance)
  - Cloudflare R2 + CDN for all images

Phase 3: Service Extraction (200K→1M)
  - Extract AI module → dedicated Python FastAPI service (GPU inference)
  - Extract search → Elasticsearch or Typesense (if Postgres full-text not enough)
  - Add BullMQ workers → separate Railway service for async jobs
  - Message queue (RabbitMQ or SQS) for notification fan-out

Phase 4: Full Microservices (1M+)
  - Property Service, User Service, AI Service, Payment Service
  - Event-driven (Kafka) for real-time sync
  - Kubernetes (EKS/GKE) for orchestration
  - Service mesh (Istio) for observability
```

---

## 19. Recommended SaaS Tools & Costs

| Category | Tool | Free Tier | Paid Plan | Why |
|---|---|---|---|---|
| Backend hosting | Railway | $5 credit/month | $20/month | Postgres + Redis included |
| Frontend hosting | Vercel | 100GB bandwidth | $20/month | Zero-config deploys |
| Database | Supabase | 500MB, 50K MAU | $25/month | Auth + DB + Storage |
| AI (complex) | OpenAI | $5 credit | Pay-per-use | Best quality |
| AI (fast/cheap) | Groq | 14,400 req/day free | Pay-per-use | 10x cheaper than OpenAI |
| Email | Resend | 3,000/month free | $20/month | Developer-friendly |
| Push notifications | Firebase FCM | Free | Free | Google, reliable |
| Maps | Mapbox | 50K loads/month | $5/1K after | Best India coverage |
| Payments | Razorpay | Free (2% fee) | 1.9% + GST | India-first, easy integration |
| Analytics | PostHog | 1M events free | $0–$450 | Self-host option available |
| Error tracking | Sentry | 5K errors free | $26/month | Best DX |
| File storage | Cloudflare R2 | 10GB free | $0.015/GB | Zero egress fees |
| Redis/Cache | Upstash | 10K req/day free | $0.2/100K req | Serverless Redis |
| SMS/OTP | MSG91 | Pay-per-use | ~₹0.20/SMS | India-specific, reliable |
| **Total MVP cost** | | **$0–$5/month** | | Launch for free |
| **Total at 10K users** | | **~$40/month** | | Very lean |

---

*Built with the architecture philosophy of a lean, modern unicorn startup. Start small, scale with confidence.*

*Last updated: 2026-05-26 | Metriva Technologies*

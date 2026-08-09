# LifeQuest V1 — Architecture

## Frontend
React + TypeScript + Vite.

## State
- Zustand: local UI and active timer state.
- TanStack Query: server state/cache.
- Supabase JS: auth/database/storage.

## Backend
Supabase:
- PostgreSQL
- Auth
- Storage
- Realtime only where it adds value
- Edge Functions for trusted AI/server workflows

## Hosting
Vercel for web preview/production.

## Mobile
Capacitor after web core stabilizes. Native integrations must sit behind adapters.

## Key architectural rules
1. One source of truth per domain state.
2. Timer uses timestamps, never interval-count as truth.
3. AI proposals are not user truth until confirmed.
4. Economy uses append-only event ledgers for critical rewards.
5. UI themes/worlds swap tokens/assets, not business logic.
6. No feature-specific CSS patch files.
7. No service-role secrets in frontend.

# LifeQuest V1 Bootstrap

Новая production-ветка LifeQuest. Старый Genshin-прототип считается Design Lab и не является основой архитектуры V1.

## Stack
- React + TypeScript + Vite
- Zustand
- TanStack Query
- Supabase
- Vercel
- Capacitor planned for Android

## First sprint included in bootstrap
- 100dvh app shell
- clean sidebar without diamond icon wrappers
- profile/settings flyout at bottom-left
- 5 primary sections: Tasks / Status / Path / Artifacts / Handbook
- persistent collapsible task groups
- larger typography baseline
- timer/clock v2 data model
- coupled clock hands
- 5-minute snap + tick feedback
- Start/Pause/Resume/Stop timer
- persistent topbar timer
- Supabase-ready client and first RLS migration
- Definition of Done + Roadmap + Architecture docs

## Environment
Copy `.env.example` to `.env.local` and set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Supabase
Apply `supabase/migrations/0001_core.sql` after the dedicated LifeQuest project is created.

## Important
Do not move old prototype CSS into V1 wholesale. Port only vetted assets/patterns through the new component/theme system.

# Alien World Defense

An original mobile sci-fi defense game where players choose an alien homeworld and resist a human invasion.

## Run & Operate

- `pnpm --filter @workspace/alien-world-defense run dev` — run the mobile game preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/alien-world-defense/app/index.tsx` — full playable game flow: selection, briefing, tutorial, and first mission
- `artifacts/alien-world-defense/assets/` — original generated world art, icon, score, effects, and character lines
- `artifacts/alien-world-defense/constants/colors.ts` — mobile visual tokens

## Architecture decisions

- The first release is offline-first and contains no backend: player selection and the opening sequence are local, which keeps the playable preview fast.
- The experience is an original alien-defense setting; it deliberately avoids copying Halo's characters, worlds, dialogue, assets, or story.
- The first mission is a polished vertical slice; future campaign content can expand the data-driven world and enemy definitions.

## Product

- Six original worlds/species choices, each with a distinct alien ability concept.
- A voiced cinematic opening, a weaponless onboarding sequence, and a first combat encounter after the defense shard is unlocked.
- Landscape touch HUD, aim/move gesture zones, haptic responses, music, weapon effects, and a controller mapping view.

## Gotchas

- Expo mobile game previews use the managed `artifacts/alien-world-defense: expo` workflow. Do not start Expo from the workspace root.
- Audio is provided by `expo-audio`, aligned to Expo SDK 57.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

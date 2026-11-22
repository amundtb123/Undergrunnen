# Undergrunnen

Mobile-first Norwegian trading game. Start in Hamar, buy cheap, travel, sell dear, and pay back Kjell within 30 days.

**Status:** a local prototype. The whole game runs in the browser on the pure engine and saves to localStorage. There is no Supabase yet.

```bash
npm install
npm run dev        # http://localhost:5173 (also reachable from a phone on the same network)
npm test           # engine unit tests + balance simulation
npm run sim        # balance report only
```

- Engine (shared with the future Edge Functions): `supabase/functions/_shared/engine/`
- Balance knobs: `supabase/functions/_shared/engine/rules.ts`
- Cities and goods: `supabase/functions/_shared/engine/content.ts`
- Architecture and plan: `docs/ARCHITECTURE.md`
- Draft DB migration (not applied): `supabase/migrations/`

Design direction comes from the starter pack (`~/Downloads/undergrunnen_claude_starter`): colour tokens, Hamar as the first fully designed city, and Clean Mode goods. `public/cities/hamar.jpg` is cropped from its AI concept image and is labelled «Konseptbilde» in the UI. Don't present it as a photo, and clarify licensing before launch.

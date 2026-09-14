# photoboth

A photobooth for long-distance couples — start a session, share the link, see
each other live, and capture a photo together at the same moment.

## How it works

- **Frontend**: Next.js (App Router) + Tailwind, deployed on Vercel.
- **Live video**: WebRTC, peer-to-peer between the two people in a session.
- **Signaling** (connecting the two peers before WebRTC takes over): Supabase
  Realtime broadcast/presence. No custom server to host or keep alive.
- **TURN fallback**: used only when a direct P2P connection can't be
  established (symmetric NAT, some mobile networks). Free tier from
  [metered.ca](https://www.metered.ca/tools/openrelay/) or Xirsys works fine
  for personal use.

Flow: `/` (landing, create a session) → `/session/[roomId]` (live video +
synced countdown + capture) → `/result/[roomId]` (the photo).

## Status

This is an early scaffold. Working:

- Landing page creates a room code and routes into a session
- Two tabs/devices opening the same `/session/[roomId]` connect over WebRTC
  and see each other live
- Either side can trigger a synced 3-2-1 countdown; both peers capture their
  own video frame at the same instant and composite side-by-side

Not yet wired up (see `TODO` comments in the code):

- The captured photo only lives in `sessionStorage` on the device that
  captured it — it needs to be uploaded to Supabase Storage so both people
  can see the same result from their own device
- No vintage/wood-texture visual design yet — plain placeholder UI for now
- No room-code collision handling or expiry

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a [Supabase](https://supabase.com) project (free tier), then copy
   `.env.local.example` to `.env.local` and fill in the project URL and anon
   key from Project Settings → API.
3. (Optional while developing) sign up for a free TURN relay at
   [metered.ca](https://www.metered.ca/tools/openrelay/) and fill in the TURN
   env vars — otherwise WebRTC falls back to STUN-only, which works fine on
   most home networks but can fail on some mobile/corporate networks.
4. Run the dev server:
   ```
   npm run dev
   ```
5. To test two "people" locally, open the same session URL in two browser
   tabs (or two devices — camera access requires HTTPS on non-localhost
   origins, so use a tunnel like `ngrok` or ship it to Vercel to test
   cross-device).

## Deployment (free)

- **App**: push to GitHub, import into [Vercel](https://vercel.com), add the
  same env vars from `.env.local` in the Vercel project settings.
- **Signaling**: nothing to deploy — Supabase Realtime is managed.
- **TURN**: nothing to deploy — using the managed free tier above.

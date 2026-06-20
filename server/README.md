# Profile summary server

A minimal Express proxy that holds the Gemini API key server-side and exposes a single endpoint
the app calls to generate the "concluded profile" (attributes, pain points, productive windows).

The app never talks to Gemini directly — the key must never be bundled into the React Native app,
since anything in the app bundle can be extracted.

## Setup

```
cd server
npm install
cp .env.example .env
```

Edit `.env` and set `GEMINI_API_KEY` to a real key. Get a free one at
https://aistudio.google.com/app/apikey (no credit card required for the free tier).

```
npm start
```

This starts the server on `http://localhost:4000` (configurable via `PORT` in `.env`).

## Testing it directly

```
curl -X POST http://localhost:4000/api/profile-summary \
  -H "Content-Type: application/json" \
  -d '{"personalityBaseline":null,"dailySchedule":null,"scenarioSession":null,"moodEntries":[],"journalEntries":[]}'
```

A `500 { "error": "Server is missing GEMINI_API_KEY." }` means the server is running but the key
isn't set yet — that's expected before you add one.

## Connecting the app to it

The app reads the proxy URL from `EXPO_PUBLIC_API_BASE_URL` (see `.env.example` at the project
root). By default it points at `http://localhost:4000`, which works when running the app in a web
browser or an Android/iOS simulator on the same machine.

**Testing on a physical phone is different**: `localhost` on your phone refers to the phone itself,
not your computer. You have two options:

1. **Same Wi-Fi network**: set `EXPO_PUBLIC_API_BASE_URL` to your computer's LAN IP, e.g.
   `http://192.168.1.23:4000` (find your IP with `ipconfig` on Windows). Restart the Expo dev
   server after changing `.env` (env vars are read at bundle time).
2. **Deploy the server**: deploy this `server/` folder to a free-tier host (Render, Railway, Fly.io,
   a Vercel/Cloudflare serverless function, etc.), set `GEMINI_API_KEY` there as a secret/environment
   variable, and point `EXPO_PUBLIC_API_BASE_URL` at the deployed URL. This is the only option once
   you're sharing the app with anyone other than yourself on your own network.

## Why a separate server at all?

Calling Gemini (or any LLM API) directly from the React Native app would require bundling the API
key into the app — and anything in an app bundle can be extracted by inspecting the compiled JS.
This server is the smallest possible thing that keeps the key off the device: one endpoint, no
auth, no database. It is **not** production-hardened (no rate limiting, no request validation
beyond what's needed to call Gemini) — for personal/demo use this is fine, but add auth and rate
limiting before exposing it publicly to other users.

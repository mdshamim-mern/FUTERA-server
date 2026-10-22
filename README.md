# FUTERA Server

Independent backend extracted from FUTERA. Migration in progress; this is not yet a completed deployment.

Use Node 24, npm install, copy .env.example to .env.local, then npm run dev. Defaults to a clearly labelled sample catalog; commerce requires configured MongoDB and private session settings. No live inventory or payment claims.

## Provider activation
Google: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET together. Configure the exact redirect URI APP_URL/auth/google/callback in the owner-controlled Google Cloud OAuth client. Run npm run db:indexes. Google accounts are created as customers; existing password accounts require password sign-in and are never linked automatically.
Gemini: set GEMINI_API_KEY and GEMINI_MODEL together, with a model available to the provider account. Requests require commerce configuration and an authenticated session. Six requests per user and eighty globally per 15-minute window are enforced in MongoDB. No provider call is made while disabled. The two modes are catalog recommendations and PC-building support. Output is advisory, not authoritative pricing, stock or compatibility.
Reviews: authenticated ownership is server-derived; public responses contain only rating, text and date. Run indexes before enabling writes.
Deployment: Vercel Express preset, Node 24, repo root. APP_URL must be the exact frontend origin. Keep COMMERCE_ENABLED=false until Atlas, AUTH_SECRET and shipping configuration are valid. No production secrets belong in Git.

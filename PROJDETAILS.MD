WeatherGPT — Hackathon Build Plan (AI-Tool Driven, Full Scope)
0. Full-Feature Map (nothing skipped, honesty tier marked)
PS Feature	Build approach	Tier
Real-time weather retrieval	OpenWeatherMap + IMD public API, polled	REAL
NL query understanding	LLM (Gemini/OpenAI) intent + slot extraction	REAL
GFS/WRF NWP integration	Adapter layer (`NWPProvider` interface) with a mock provider returning realistic GFS-shaped JSON (pressure levels, grid data) + config to swap in a real NOAA GFS/NOMADS feed later	ADAPTER (real interface, mocked data source)
MQTT/WIS2.0 real-time ingestion	Real Mosquitto MQTT broker (Docker) + a publisher script simulating station feeds pushing to topics `weather/{station}/obs`; backend subscribes live	REAL (real broker, simulated publishers — same as WIS2.0 pattern)
Extreme weather alerts	Real rule engine on live API severity codes + MQTT alert topic `weather/alerts/{region}`	REAL
Location-based forecasting	Geolocation + reverse geocoding + Leaflet map	REAL
Multilingual (Indian languages)	Google Translate API, 6+ languages (Hindi, Bengali, Tamil, Telugu, Marathi, English)	REAL
Climate trend/historical analysis	Open-Meteo historical API + simple trend chart (Chart.js)	REAL
Voice interaction	Web Speech API STT/TTS, language-matched	REAL
Mobile-based platform	React PWA (installable, offline shell) — not native, but installable on Android via Vivo/any phone browser	REAL (PWA, not native APK — call this out explicitly)
Scalable real-time architecture	Docker Compose: backend + MQTT broker + Postgres + Redis cache	REAL
GIS tools	Leaflet + weather overlay tiles (OpenWeatherMap map layers: precipitation, clouds, temp)	REAL
Pitch line for the adapter tier: "NWP integration is built as a provider interface — today it runs on a physically-realistic mock GFS feed, and swapping in NOAA's live NOMADS GFS endpoint is a config change, not a rebuild." This is true, defensible, and shows architecture maturity instead of a fake claim.
---
1. Architecture (full scope)
```
React PWA + Tailwind
 (chat, mic, map w/ weather layers, trend charts, lang switcher)
        │
        ▼
Node.js/Express backend  ───────────────┐
        │                               │
        ├── OpenWeatherMap/IMD API      │
        ├── Open-Meteo historical API   │  MQTT client (Mosquitto broker)
        ├── NWPProvider adapter         │  ← subscribes weather/{station}/obs
        │     (mock GFS + real swap-in) │  ← publishes weather/alerts/{region}
        ├── LLM API (intent + reply)    │
        ├── Rule-based alert engine     │
        └── Google Translate API        │
        │                               │
        ▼                               ▼
PostgreSQL (users, history, stations) + Redis (cache, hot alerts)

Docker Compose ties: backend, Mosquitto, Postgres, Redis
```
---
2. Build Phases with AI-Tool Prompts
Use Claude Code or Cursor. Paste in sequence. Verify each phase runs before the next — with this much scope, an unverified broken layer costs you hours later.
Phase 1 — Docker Compose infra skeleton (1 hr)
```
Create a docker-compose.yml for a project called WeatherGPT with these services:
- backend: Node.js/Express app (build from ./backend, port 5000)
- mosquitto: Eclipse Mosquitto MQTT broker (port 1883), with a basic mosquitto.conf allowing anonymous local connections for dev
- postgres: Postgres 16, with env vars for db name/user/pass, exposed port 5432, volume for persistence
- redis: Redis 7, port 6379

Also give me the mosquitto.conf file and a .env.example listing all required env vars across services.
```
Phase 2 — Backend core: chat + weather (2-3 hrs)
```
Create a Node.js + Express backend for WeatherGPT.

Requirements:
- POST /api/chat: accepts { message, lat, lon, lang }. Fetches current + 5-day forecast from OpenWeatherMap API (env OPENWEATHER\\\_API\\\_KEY). Passes message + weather JSON to Gemini API (env GEMINI\\\_API\\\_KEY) with a system prompt restricting it to only use provided data, concise advisory tone, under 60 words, and to tag intent as one of: general, farmer, aviation, marine, urban\\\_planning based on phrasing.
- Returns { reply, raw\\\_weather, severity, intent }
- GET /api/health
- Connect to Postgres (pg pool) and Redis (ioredis) using env vars from docker-compose, log successful connection on boot
- CORS, dotenv, centralized error handler middleware

Give me full file structure, ready to run with npm install \\\&\\\& npm start inside the Docker container.
```
Phase 3 — NWP adapter layer (1-2 hrs)
```
Create an NWPProvider adapter pattern in the Node.js backend:
- Define an interface/class NWPProvider with method getForecastGrid(lat, lon) returning { model: string, runTime: string, pressureLevels: number\\\[], gridData: array of {lat, lon, temp, windU, windV, humidity} }
- Implement MockGFSProvider that generates physically plausible synthetic grid data around the given lat/lon (realistic ranges, slight randomization) shaped exactly like real GFS output would be
- Implement a stubbed NOAAGFSProvider class with the real NOMADS GFS endpoint URL structure filled in and a TODO marking it as the swap-in target, but not implemented/called
- Add GET /api/nwp?lat=\\\&lon= that calls the currently configured provider (env var NWP\\\_PROVIDER=mock|noaa, default mock) and returns the grid JSON
- Add a code comment block explaining the swap-in path for production
```
Phase 4 — MQTT real-time layer (2 hrs)
```
Add MQTT integration to the Node.js backend using the mqtt npm package, connecting to the Mosquitto broker from docker-compose (mqtt://mosquitto:1883):
- Subscribe to topic weather/+/obs (station observations) — on message, parse JSON {station, temp, humidity, windSpeed, timestamp}, upsert into Postgres table station\\\_observations, and cache latest per-station reading in Redis
- Publish to weather/alerts/{region} whenever the alert engine (Phase 5) detects severe conditions for a region, with payload {region, severity, reason, timestamp}
- Add GET /api/stations/live returning latest cached readings from Redis for all known stations
- Create a separate simulate-stations.js script that publishes fake station readings every 10s to weather/{stationId}/obs for demo purposes, with 5 hardcoded Indian city stations
```
Phase 5 — Alert/warning engine (1-2 hrs)
```
Build a rule-based severe weather alert engine in the Node.js backend:
- Function evaluateSeverity(weatherData) checking OpenWeatherMap weather\\\[].id codes (2xx thunderstorm, 5xx>502 heavy rain, extreme temp >40°C or <5°C, wind >60kmh) plus incoming MQTT station data (Phase 4) for the same thresholds
- Returns { severity: "normal"|"warning"|"severe", reason: string, region: string }
- On severe/warning detection, publish to MQTT topic weather/alerts/{region} (from Phase 4) and store in a Postgres alerts table with timestamp
- Add GET /api/alerts/active returning all alerts from the last 6 hours from Postgres
- Wire this engine to run on every /api/chat weather fetch AND every incoming MQTT station message
```
Phase 6 — Historical/climate trend data (1 hr)
```
Add a GET /api/climate/trend endpoint to the Node.js backend:
- Fetches historical daily weather for the past 30 days for given lat/lon from Open-Meteo's free historical API (no key required)
- Returns { dates: \\\[], avgTemp: \\\[], rainfall: \\\[] } shaped for a line chart
- Cache the response in Redis for 6 hours per lat/lon key to avoid re-fetching
```
Phase 7 — Multilingual layer (1-2 hrs)
```
Add a translation step to the Node.js backend /api/chat and /api/alerts routes:
- After generating the reply, if req.body.lang !== "en", translate using Google Translate API (env GOOGLE\\\_TRANSLATE\\\_KEY) into the requested language. Support: hi, bn, ta, te, mr, en.
- Return translated text in reply field, keep raw\\\_weather numbers untranslated
- Fallback to English with a console warning if the Translate API fails
```
Phase 8 — Frontend: React PWA (4-5 hrs)
```
Create a React + Tailwind Progressive Web App for WeatherGPT.

Requirements:
- Chat interface: bubble UI, dark mode, input + send + mic button (Web Speech API STT matched to selected language)
- Speaker icon per bot message using SpeechSynthesis API (TTS) in selected language
- Language dropdown: English, Hindi, Bengali, Tamil, Telugu, Marathi — sends lang to backend on every request
- On mount: request geolocation, fallback to manual location search input
- Leaflet map showing current location + OpenWeatherMap weather overlay tiles (precipitation, clouds, temperature toggle buttons)
- Alert banner component: polls GET /api/alerts/active every 30s, shows color-coded banner (yellow=warning, red=severe) with dismiss
- Climate trend section: line chart (Chart.js) fed by GET /api/climate/trend, toggle between temp/rainfall view
- Live stations panel: small list fed by GET /api/stations/live, auto-refresh every 10s
- manifest.json + service worker for PWA installability (offline app shell caching, not full offline data)

Structure as multiple components, not one file. Give me the full file tree and code.
```
Phase 9 — Deploy for demo (1-2 hrs)
```
Give me deployment steps to:
- Deploy the full docker-compose stack (backend, mosquitto, postgres, redis) to Render or Railway (whichever supports multi-service docker-compose easiest)
- Deploy the React PWA to Netlify/Vercel, wired to the deployed backend URL via env var
- Run simulate-stations.js as a background worker/cron on the same platform so live station data keeps flowing during judging
Include a pre-demo checklist: verify MQTT connection, verify alert banner triggers, verify all 6 languages respond, verify PWA installs on Android (test on your Vivo T3 Pro).
```
---
3. Pitch structure (5 min slot)
Problem (30s) — fragmented weather info, no conversational access
Live demo (2.5 min) — general forecast query, farmer-context query, switch language, trigger a real alert (simulated station), show live station panel updating, show climate trend chart
Architecture slide (1 min) — show full diagram, call out MQTT/Postgres/Redis/adapter pattern explicitly — this is your differentiator vs. every other team's plain chatbot wrapper
Honesty slide, 1 line (built in, not dodged) — "NWP runs on a provider adapter with a physically-realistic mock feed today; swapping to NOAA's live GFS/NOMADS endpoint is a config change, shown in code"
Impact + scalability (30s) — farmers, aviation, disaster mgmt, urban planning use cases from PS
Rule: if a judge asks "is this live GFS data?" — say no, explain the adapter architecture, show them the code if asked. This is now a strength ("we built the integration point and proved the pattern") not a weakness, because you own it upfront instead of getting caught.
---
4. Time budget (36 hr hackathon) — full scope
Phase	Hours
Docker Compose infra	1
Backend core (chat + weather)	3
NWP adapter layer	2
MQTT real-time layer	2
Alert engine	1.5
Climate trend endpoint	1
Multilingual layer	1.5
Frontend PWA (all features)	5
Integration + bug fixing	5
Deploy	2
Pre-demo testing checklist	1
Buffer / sleep / pitch prep	rest (~10 hrs)
Total core build: ~25 hrs of a 36 hr window. This is tight — assign owners per phase if you're a team, don't build serially solo. If solo, cut Phase 6 (climate trend) and Phase 4's Postgres persistence (keep MQTT live-only, skip the DB write) first if you run over — those are the two most droppable without visibly breaking the demo.
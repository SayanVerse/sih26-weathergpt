# Known Technical Issues

## ISSUE-001: MapTiler API Key Detection
- **Date:** 2026-09-26
- **Phase:** 1
- **File:** `weathergpt-frontend/src/components/map/...`
- **Problem:** The frontend fails to cleanly detect or process the MapTiler API key under certain conditions.
- **Severity:** Medium
- **Current workaround:** Ignored for now.
- **Recommended fix:** Review VITE environment variable exposure and Leaflet config.
- **Status:** OPEN

## ISSUE-002: IP Detection Localhost Limitation
- **Date:** 2026-09-26
- **Phase:** 2
- **File:** `backend/services/geocoding.py`
- **Problem:** IP-based location detection fails or defaults to unexpected locations when testing from `localhost` / `127.0.0.1`.
- **Severity:** Low
- **Current workaround:** Use manual search or browser geolocation when developing locally.
- **Recommended fix:** Mock IP resolution in local dev mode.
- **Status:** OPEN

## ISSUE-003: Gemini Free-Tier Rate Limits (429)
- **Date:** 2026-09-26
- **Phase:** 6
- **File:** `backend/services/ai_service.py`
- **Problem:** Frequent testing with `gemini-3.8-flash` triggers `429 RESOURCE_EXHAUSTED` due to the free tier's 5 RPM / 20 RPD limits.
- **Severity:** High
- **Current workaround:** The backend catches the exception and returns a generic "I'm having trouble connecting" fallback message so the UI doesn't crash.
- **Recommended fix:** Implement persistent caching for similar AI queries, upgrade API tier, or switch to a lower-tier/less restrictive model permanently.
- **Status:** OPEN

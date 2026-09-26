# CURRENT ARCHITECTURE

## Overview
WeatherGPT uses a decoupled Client-Server architecture.

### User
↓
### Frontend (Vite + React)
- **Pages**: Dashboard, Assistant, Map, Settings, Locations
- **State**: React Context (`WeatherContext`, `SettingsContext`)
- **Styling**: Tailwind CSS
↓
### Backend API (FastAPI)
- **Routers**: `/api/weather`, `/api/location`, `/api/ai`, `/api/health`
- **Validation**: Pydantic schemas
- **Workers**: Celery (configured but largely unused in core flow yet)
↓
### Services
- `ai_service.py`: Intent extraction and Gemini interaction.
- `geocoding.py`: Location resolution.
- `openweather.py`: Weather data fetching.
- `weather_context_service.py`: Converts JSON data into Markdown for LLM.
↓
### External Providers
- **Weather APIs**: OpenWeatherMap
- **AI Provider**: Google Gemini (`gemini-1.5-flash`/`gemini-3.8-flash`)
- **Map Tiles**: MapTiler (via Leaflet in frontend)
↓
### Database / Caching
- **Database**: PostgreSQL (configured, not actively persisting chat history yet)
- **Cache**: Redis (configured for Celery/basic caching)

---

## Planned Architecture (Not Implemented)
- MQTT Mosquitto Broker for real-time station ingestion.
- Background worker for alert engine processing.
- NWP Adapter for GFS/NOMADS integration.

# WeatherGPT Backend (Phase 1)

This is the FastAPI backend for **WeatherGPT**, providing real-time weather data and AI insights to the frontend dashboard. 

## Features
- **Real Weather Integration**: Fetches live data from Open-Meteo.
- **Data Normalization**: Transforms raw scientific weather data into clean, frontend-ready typed schemas (Pydantic).
- **Location Geocoding**: Search for cities and locations worldwide.
- **Rule-based AI Insights**: Analyzes live weather conditions and provides actionable insights and chat responses.

## Architecture
The backend is built using a clean, layered architecture:
```text
backend/
├── main.py                 # FastAPI application and route definitions
├── schemas/                # Pydantic models (weather.py, location.py)
├── services/               # Core business logic
│   ├── openmeteo.py        # Weather provider client and normalizer
│   └── geocoding.py        # Location search service
├── tests/                  # Automated pytest suite
└── .env.example            # Environment configurations
```

## Setup & Installation

### 1. Requirements
- Python 3.10+
- `pip` or `uv`

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Copy the `.env.example` file:
```bash
cp .env.example .env
```

### 4. Run the Development Server
```bash
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.

## Documentation
Once running, the interactive Swagger documentation is automatically generated:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Testing
Run the automated test suite using pytest:
```bash
pytest tests/
```

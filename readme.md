# WeatherGPT

This project implements the Phase 1 full tech stack architecture for WeatherGPT, integrating Open-Meteo data through a robust Python/FastAPI backend and presenting it on a Next.js 16 frontend.

## Tech Stack Overview

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), Celery
- **Database/Cache**: PostgreSQL (PostGIS), Redis
- **DevOps**: Docker, Docker Compose

## Running the Application (Recommended)

The easiest way to start all services (Database, Redis, Backend API, Celery Worker, Frontend) is using Docker Compose:

1. Make sure you have [Docker](https://docs.docker.com/get-docker/) installed.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API (Swagger UI)**: http://localhost:8000/docs
   
## Running Manually (Without Docker)

Since you have Python installed, you can run the backend and frontend separately if you prefer not to use Docker.

### 1. Run the Backend API

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows
   .\.venv\Scripts\activate
   # macOS/Linux
   # source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
*(Note: Celery tasks will require a running Redis instance.)*

### 2. Run the Frontend

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Next Steps

- Integrate PostgreSQL models in `backend` using SQLAlchemy/asyncpg.
- Setup WebSocket data streaming.
- Integrate Shadcn/ui MapLibre components into Next.js.

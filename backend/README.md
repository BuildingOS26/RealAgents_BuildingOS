# BuildingOS Backend

Simple FastAPI backend for managing building data.

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The server will run on `http://localhost:8000` and the frontend (configured in `vite.config.ts`) will proxy API requests from `/_api` to this backend.

## API Endpoints

- `GET /_api/buildings` - Get all buildings
- `POST /_api/buildings` - Create a new building
  - Body: `{ "name": string, "address": string, "floors": string, "sqft": string }`

## Data Storage

Currently using in-memory storage. Data will be lost on server restart. Replace with a database (SQLite, PostgreSQL, etc.) for persistent storage.

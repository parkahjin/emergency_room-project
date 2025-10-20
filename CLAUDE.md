# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emergency Room Congestion Prediction Service - A full-stack application that predicts emergency room congestion levels across Busan hospitals using machine learning. The system provides real-time congestion predictions with an interactive map interface.

**Tech Stack:**
- Backend: Spring Boot 3.5.6 with Java 21, PostgreSQL, JPA
- Frontend: React 19.1.1 with Kakao Maps API integration
- Data Analysis: Jupyter notebooks for ML model training
- Deployment: Docker containerization

## Build and Development Commands

### Backend (Spring Boot)

```bash
# Build the project
cd backend
./gradlew build

# Run the application (port 8080)
./gradlew bootRun

# Build JAR file only
./gradlew bootJar

# Run tests
./gradlew test

# Clean build artifacts
./gradlew clean
```

### Frontend (React)

```bash
# Install dependencies
cd frontend
npm install

# Start development server (port 3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Docker

```bash
# Build backend Docker image
cd backend
docker build -t emergency-backend .

# The backend Dockerfile uses multi-stage build:
# - Build stage: gradle:8.5-jdk21
# - Runtime stage: eclipse-temurin:21-jre-jammy
```

## Architecture

### Backend Structure (com.project.emergency)

**Layered Architecture:**
- `controller/` - REST API endpoints (@RestController with @CrossOrigin)
- `service/` - Business logic layer
- `repository/` - JPA data access (extends JpaRepository)
- `entity/` - JPA entities (Hospital, Prediction)
- `common/` - Shared utilities (ApiResponse wrapper)
- `config/` - Configuration classes (WebConfig for CORS)

**Key Entities:**

1. **Hospital** (`hospitals` table)
   - Primary key: String id (e.g., "ER001")
   - Location data: BigDecimal latitude/longitude
   - Metadata: district, emergencyLevel, hospitalType, bedsTotal
   - Equipment flags: hasCt, hasMri

2. **Prediction** (`emergency_predictions` table)
   - Auto-generated Integer id
   - References: hospitalId (String, not a JPA relation)
   - Time-based: predictionHour (0-23)
   - Metrics: predictedWaitTime (minutes), congestionLevel ("여유"/"보통"/"혼잡")
   - Display: congestionColor for UI mapping

**API Response Pattern:**
All endpoints return `ApiResponse<T>` with structure:
```json
{
  "status": "success" | "error",
  "message": "...",
  "data": T
}
```

### Frontend Structure

**State Management:**
- All state managed in App.js using React hooks
- No external state management library (Redux, Context API not used)
- Key states: hospitals, userLocation, selectedHour, sortBy, radius

**Component Hierarchy:**
```
App.js (main state container)
├── Header (search, time selector, location display)
├── MapSection (Kakao Maps with hospital markers)
├── Sidebar (hospital list with sorting)
└── Modal (hospital detail view)
```

**API Integration:**
- All backend calls centralized in `services/api.js`
- Base URL: `http://localhost:8080/api`
- Uses Axios with 10-second timeout
- Distance calculation: Haversine formula for straight-line distance
- Route calculation: Kakao Directions API for actual driving distance/time

**Location Handling:**
- Currently hardcoded to Yangjeong Station (양정역): lat 35.1697, lng 129.0704
- GPS code is commented out but preserved for future use
- Coordinate-to-district mapping implemented manually for Busan's 16 districts

### Data Analysis Pipeline

Located in `data-analysis/notebooks/`:
1. `01_data_collection.ipynb` - Collect hospital data
2. `02_import_to_mysql.ipynb` - Initial MySQL import (deprecated)
3. `migrate_to_postgres.ipynb` - PostgreSQL migration
4. `05_ml_training.ipynb` - ML model training for congestion prediction

The prediction data is pre-generated and stored in the database (24 hours × all hospitals).

## Database Configuration

**PostgreSQL Connection:**
- Connection URL via environment variable: `jdbc:${DATABASE_URL}`
- Port configured via: `${PORT:8080}`
- JPA DDL mode: `update` (auto-creates/updates schema)
- SQL logging enabled in development

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default 8080)
- `KAKAO_API_KEY` - Kakao REST API key
- `KAKAO_JS_KEY` - Kakao JavaScript API key

## Important Implementation Details

### Distance Calculation Strategy
The app uses a two-tier approach:
1. **Initial load**: Haversine formula calculates straight-line distance for all hospitals
2. **Top 10 optimization**: Kakao Directions API fetches actual driving distance/time for the 10 closest hospitals only
3. This hybrid approach balances accuracy with API rate limits

### Time-Based Predictions
- Predictions are hour-based (0-23)
- Current hour is selected by default: `new Date().getHours()`
- Changing the time slider reloads predictions from `/api/predictions/hour/{hour}/all`
- Each hospital has 24 pre-generated prediction records

### CORS Configuration
- Backend allows `http://localhost:3000` for development
- PredictionController uses `origins = "*"` (should be restricted in production)

### Frontend Data Flow
1. Component mounts → `fetchHospitalsData()`
2. Fetches hospitals + current predictions in parallel
3. Adds distance calculations (Haversine)
4. Updates top 10 with Kakao route data
5. Formats congestion colors: green/yellow/red/gray
6. Sorts by distance and displays

### API Endpoint Patterns

**Hospital endpoints:**
- `GET /api/hospitals` - All hospitals
- `GET /api/hospitals/{id}` - Single hospital
- `GET /api/hospitals/search?keyword=X` - Search by name
- `GET /api/hospitals/district/{district}` - Filter by district
- `POST /api/hospitals/nearby` - Nearby hospitals (body: lat, lng, limit)

**Prediction endpoints:**
- `GET /api/predictions/{hospitalId}/current` - Current hour prediction
- `GET /api/predictions/{hospitalId}/all` - 24-hour predictions
- `GET /api/predictions/current/all` - All hospitals current prediction
- `GET /api/predictions/hour/{hour}/all` - All hospitals at specific hour
- `GET /api/predictions/level/{level}` - Filter by congestion level

**Kakao integration endpoints:**
- `GET /api/kakao/directions?originLat=X&originLng=Y&destLat=X&destLng=Y`
- `GET /api/kakao/hospital-route/{hospitalId}?userLat=X&userLng=Y`

## Testing Approach

- Backend: JUnit tests in `src/test/java/`
- Frontend: Jest + React Testing Library configured
- Note: Test package has naming mismatch (`com.example.demo` vs `com.project.emergency`)

## Known Technical Debt

1. No JPA relationship between Hospital and Prediction entities (manual joining in service layer)
2. Manual coordinate-to-district mapping instead of reverse geocoding API
3. CORS wildcard on PredictionController should be restricted
4. Test package naming inconsistency
5. GPS location code commented out, using hardcoded test location
6. No proper error boundaries in React components
7. API base URL hardcoded in frontend (should use environment variables)

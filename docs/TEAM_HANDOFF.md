# Quick tech handoff

## What Javi set up
- Repo + Next.js base is ready.
- Open-Meteo is already giving us real weather data.
- Soil moisture is mocked like it was coming from a sensor.
- NDVI is mocked for now.
- A simple rules engine combines the data and outputs the actions shown in **Today**.
- UI has been simplified around the main idea: less dashboard, more "what do I need to do today?".

## Data/API plan
**Use now:** Open-Meteo + mock sensor.

**Add next:** Copernicus Sentinel-2 / Sentinel Hub Stats API for real NDVI on one demo field.

**Only if useful later:** NASA POWER (history), Planetary Computer (satellite backup), farmOS (interop reference).

## Backend next
- make `/api/sensors` instead of hardcoding the mock value
- define farm/field/device data shape
- make `/api/ndvi` with Copernicus
- feed everything into the existing recommendation engine
- only add Supabase once we actually need saved tasks/users

## Suggested work split
- backend/data: sensor endpoint + field data model + Copernicus
- frontend: polish Today/field view + interactions
- research/pitch: user/problem, competitors, impact, demo story
- whoever finishes first helps connect the pieces and test the final flow

## Demo we should aim for
Open a farm → real weather + sensor + satellite signals arrive → **3 things need your attention today** → open one action and see exactly why it was generated.

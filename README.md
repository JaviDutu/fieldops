# FieldOps — Climate Hack-tion MVP

Working-name starter for an **action-first farm operating layer for small farmers**.

Instead of making farmers inspect separate weather, sensor and satellite dashboards, the product combines signals into a prioritised daily action feed.

## Run locally
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`.

## Current MVP
- real Open-Meteo weather integration
- mock soil-moisture sensor
- mock satellite/NDVI signal
- deterministic recommendation engine
- responsive Today dashboard

## Next integration
Add Sentinel-2 NDVI through Copernicus Sentinel Hub after creating OAuth credentials.

See `docs/APIS_AND_MVP.md` for the technical plan and team split.

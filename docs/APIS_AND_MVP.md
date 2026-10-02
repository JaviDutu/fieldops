# Data + APIs — what we are actually using

## Core idea
We are **not** trying to build another analytics dashboard. The MVP should connect a few different farm signals and turn them into a short list of actions:

**weather + sensor + satellite → what should I care about today?**

## MVP data sources

### Open-Meteo — YES, already connected
Real weather data, no key needed for the basic API.

We currently use:
- rain in the next 24h
- ET0 (useful signal for irrigation demand)
- VPD (useful signal for plant water stress)
- peak temperature

Why this one: very fast to integrate and enough to make the first recommendation flow real. Open-Meteo can also expose modelled soil moisture, but for the MVP we keep soil moisture as a separate sensor source because the whole point is to show that we can connect external farm devices.

### Soil sensor — MOCK FOR MVP
We simulate a tiny vendor/device payload, e.g.:

```json
{
  "device_id": "soil-field-2",
  "soil_moisture_pct": 23,
  "timestamp": "2026-10-02T08:00:00Z"
}
```

Later the backend can swap this for MQTT, a webhook or a real vendor API without changing the UI/recommendation logic.

### Copernicus Sentinel-2 — NEXT REAL INTEGRATION
This should be the next integration if we have time.

Best version for the demo:
- one demo parcel/polygon
- get mean NDVI for recent imagery
- compare against an earlier period
- if it drops a lot, recommend inspecting that field

The cleanest route is Copernicus Data Space **Sentinel Hub Statistical API**. It can calculate NDVI statistics directly for an area, so we do not need to download/process full satellite images ourselves. It does require OAuth client credentials.

### Backups / future
- **Microsoft Planetary Computer:** public STAC access to Sentinel-2. Good backup if Copernicus auth wastes too much time.
- **NASA POWER:** useful later for historical/agroclimate baselines, not needed for the core demo.
- **farmOS:** useful reference for future interoperability, but we should not rebuild our hackathon project around it.

## Recommendation logic
For now it should be deterministic and explainable, not "AI decides farming".

Examples:
- low soil moisture + almost no rain → inspect / irrigation recommendation
- high ET0 or VPD → water-stress warning
- NDVI drop → inspect the affected field

An LLM can be added later to explain those recommendations in nicer language, but it should not be the thing making the agronomic decision.

## What is already working
- Next.js starter + repo
- real Open-Meteo request
- mock soil sensor value
- mock NDVI value
- rules combining those inputs into ranked actions
- responsive "Today" UI

## Next backend steps
1. Put the mock sensor behind its own `/api/sensors` endpoint.
2. Store a simple farm/field structure (farm → fields → devices/data sources).
3. Add Copernicus auth + one `/api/ndvi` route for a demo parcel.
4. Return one normalized data shape to the recommendation engine.
5. Later persist actions/tasks in Supabase if we actually need history/accounts.

# APIs + MVP decision sheet

## Product thesis
**Not another farm dashboard.** Connect fragmented farm data and turn it into a prioritised daily action plan for small farmers.

Core demo sentence:
> Weather + satellite + sensor data → "these are the 3 things you should care about today, why, and what to do next."

## MVP integrations

### 1) Open-Meteo — use now
**Why:** fastest real integration, no API key for basic use, and contains agriculture-relevant forecast variables.

Useful variables:
- precipitation / precipitation probability
- ET0 FAO reference evapotranspiration
- vapour pressure deficit (VPD)
- temperature / humidity / wind
- some forecast models expose soil moisture too

Use in MVP:
- rainfall warning
- potential water-stress signal
- timing irrigation tasks

Status: **implemented in `/app/api/weather/route.ts`**.

### 2) Simulated soil sensor — use now
Do not waste hackathon time on physical hardware.

Mock a sensor payload such as:
```json
{
  "device_id": "soil-field-2",
  "soil_moisture_pct": 23,
  "temperature_c": 29.2,
  "timestamp": "2026-10-02T08:00:00Z"
}
```

Later this can be swapped for MQTT/webhook/vendor APIs.

### 3) Copernicus Sentinel-2 / Sentinel Hub — add second
**Why:** official examples already cover NDVI images and NDVI time-series for a field.

Trade-off: requires a Copernicus account + OAuth client credentials. Do this after weather + action feed works.

Best MVP output:
- latest NDVI mean for one demo parcel
- comparison vs previous period
- if change < -10%, flag zone for inspection

Environment variables to add later:
```
COPERNICUS_CLIENT_ID=
COPERNICUS_CLIENT_SECRET=
```

### 4) Microsoft Planetary Computer — fallback satellite route
Its STAC API is publicly accessible anonymously and includes Sentinel-2 L2A. Useful if Sentinel Hub auth becomes a time sink. We still need code to calculate/serve the vegetation index, so this is a fallback rather than first choice.

### 5) NASA POWER — optional / future
Global agriculture-oriented historical and near-real-time meteorological/solar data via JSON/CSV APIs. Useful for long-term baselines or climate trends, not necessary for the first demo.

### 6) farmOS — inspiration / future interoperability
Open-source farm management platform exposing JSON:API and JS/Python libraries. Do **not** rebuild the hackathon around it now, but it is good evidence that an open integration layer is realistic.

## Recommendation engine
Do not make an LLM decide agronomy.

Use explicit rules first:
- low sensor soil moisture + little rain forecast → inspect / irrigate recommendation
- high ET0 or VPD → water-stress warning
- NDVI decline → inspect field for stress

Then optionally use an LLM only to explain the recommendation in farmer-friendly language.

## MVP screens
1. **Today** — ranked actions, explanation, source badges, mark reviewed/completed.
2. **Farm overview** — 2–3 parcels and simple health state.
3. **Data sources** — Weather connected, Soil Sensor connected/mock, Satellite connected/demo.

Anything beyond this is stretch scope.

## Suggested 4-person split tomorrow
- **Javi:** repo/architecture + integrations + first working vertical slice
- **Person 2:** backend/recommendation rules + sensor data shape
- **Person 3:** dashboard/UI/map
- **Person 4:** research/impact/pitch + support on safest backend tasks

Then rebalance after the first 30–45 min depending on experience.

## First demo story
1. Open demo farm.
2. System has real forecast + mock soil sensor + demo NDVI.
3. "3 things need your attention today."
4. Open irrigation recommendation → see why it was generated and from which sources.
5. Mark it reviewed / convert to task.

If this works cleanly, the core product is already demonstrable.

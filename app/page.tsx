"use client";

import { useEffect, useMemo, useState } from "react";
import { buildRecommendations, Recommendation } from "@/lib/recommendations";

type Weather = {
  next24h: { rainMm: number; et0Mm: number; vpdPeakKpa: number; tempPeakC: number };
  provider: string;
};

const mockFarm = {
  name: "Demo Farm — Efate",
  crop: "Mixed vegetables",
  soilMoisturePct: 23,
  ndviChangePct: -12,
  lat: -17.7333,
  lon: 168.3273,
};

export default function Home() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/weather?lat=${mockFarm.lat}&lon=${mockFarm.lon}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Weather API failed"))))
      .then(setWeather)
      .catch((e) => setError(e.message));
  }, []);

  const recommendations: Recommendation[] = useMemo(() => {
    return buildRecommendations({
      sensorSoilMoisturePct: mockFarm.soilMoisturePct,
      rainNext24hMm: weather?.next24h.rainMm ?? 0.7,
      et0Next24hMm: weather?.next24h.et0Mm ?? 5.1,
      vpdPeakKpa: weather?.next24h.vpdPeakKpa ?? 1.8,
      ndviChangePct: mockFarm.ndviChangePct,
    });
  }, [weather]);

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="eyebrow">FIELDOPS / CLIMATE HACK-TION</div>
          <h1>{mockFarm.name}</h1>
          <p>{mockFarm.crop} · small-farm demo</p>
        </div>
        <div className="status">● Live weather {weather ? "connected" : "loading"}</div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">TODAY</div>
          <h2>{recommendations.length} things need your attention</h2>
          <p>We turn fragmented farm data into a prioritised action list.</p>
        </div>
        <button onClick={() => location.reload()}>Refresh data</button>
      </section>

      {error && <div className="error">Weather API unavailable — showing demo fallback values.</div>}

      <section className="metrics">
        <Metric label="Soil moisture" value={`${mockFarm.soilMoisturePct}%`} note="Mock field sensor" />
        <Metric label="Rain next 24h" value={`${weather?.next24h.rainMm ?? "…"} mm`} note="Open-Meteo" />
        <Metric label="ET₀ next 24h" value={`${weather?.next24h.et0Mm ?? "…"} mm`} note="Irrigation signal" />
        <Metric label="NDVI change" value={`${mockFarm.ndviChangePct}%`} note="Satellite demo" />
      </section>

      <section className="grid">
        <div className="panel actions">
          <div className="panelTitle">Recommended actions</div>
          {recommendations.map((item) => (
            <article key={item.id} className={`action ${item.priority}`}>
              <div className="actionTop">
                <span className="pill">{item.priority}</span>
                <span className="sources">{item.source.join(" + ")}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.reason}</p>
              <div className="next"><strong>Next:</strong> {item.action}</div>
              <button>Mark as reviewed</button>
            </article>
          ))}
        </div>

        <aside className="panel">
          <div className="panelTitle">Field overview</div>
          <div className="fieldMap" aria-label="Demo farm map">
            <div className="parcel p1">Field 1<br/><small>Normal</small></div>
            <div className="parcel p2">Field 2<br/><small>Dry</small></div>
            <div className="parcel p3">Field 3<br/><small>Stress</small></div>
          </div>
          <div className="legend">
            <span>Weather ✓</span><span>Sensor ✓</span><span>Satellite demo</span>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

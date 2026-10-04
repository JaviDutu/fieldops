"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { buildRecommendations, Recommendation } from "@/lib/recommendations";
import { demoFarm } from "@/lib/farm";
import Navbar from "@/component/navbar";

type Weather = {
  next24h: { rainMm: number; et0Mm: number; vpdPeakKpa: number; tempPeakC: number };
  provider: string;
};

const mockFarm = {
  name: "Efate Demo Farm",
  crop: "Mixed vegetables",
  soilMoisturePct: 23,
  ndviChangePct: -12,
  lat: -17.7333,
  lon: 168.3273,
};

const FARM_IMAGE =
  "https://images.unsplash.com/photo-1777063012816-35f5bcbe4e09?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000";

export default function Home() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldId, setFieldId] = useState(demoFarm.fields[0].id);
  const field = demoFarm.fields.find((f) => f.id === fieldId) ?? demoFarm.fields[0];
  useEffect(() => {
    axios
      .get<Weather>("/api/weather", {
        params: {
          lat: mockFarm.lat,
          lon: mockFarm.lon,
        },
      })
      .then((response) => setWeather(response.data))
      .catch((error) => setError(error?.response?.data?.message ?? error.message ?? "Weather API failed"));
  }, [field.lat, field.lon]);

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
    <div className="appShell">
      <Navbar farmName={mockFarm.name} isOnline={!!weather} />

      <main className="workspace">
        <section className="mainColumn">
          <div className="pageHeading">
            <div>
              <p className="kicker">TODAY</p>
              <h1>{recommendations.length} things to act on</h1>
              <p className="subtle">One place for the signals that actually need a decision.</p>
            </div>
            <button className="secondaryButton" onClick={() => location.reload()}>
              Refresh
            </button>
          </div>

          {error && (
            <div className="errorNotice">Weather is temporarily unavailable — demo fallback values are being used.</div>
          )}

          <div className="actionList">
            {recommendations.map((item) => (
              <article key={item.id} className="actionRow">
                <div className={`priorityDot ${item.priority}`} aria-label={`${item.priority} priority`} />
                <div className="actionBody">
                  <div className="actionHeading">
                    <h2>{item.title}</h2>
                    <span className="sourceText">{item.source.join(" · ")}</span>
                  </div>
                  <p>{item.reason}</p>
                  <div className="recommendedNext">
                    <span>Recommended next step</span>
                    <strong>{item.action}</strong>
                  </div>
                </div>
                <button className="reviewButton">Review</button>
              </article>
            ))}
          </div>

          <section className="conditions" aria-label="Current conditions">
            <Condition label="Soil moisture" value={`${mockFarm.soilMoisturePct}%`} meta="sensor demo" />
            <Condition label="Rain · 24h" value={`${weather?.next24h.rainMm ?? "—"} mm`} meta="Open-Meteo" />
            <Condition label="ET₀ · 24h" value={`${weather?.next24h.et0Mm ?? "—"} mm`} meta="Open-Meteo" />
            <Condition label="NDVI change" value={`${mockFarm.ndviChangePct}%`} meta="satellite demo" />
          </section>
        </section>

        <aside className="sideColumn">
          <section className="farmCard">
            <div className="farmPhoto" style={{ backgroundImage: `url(${FARM_IMAGE})` }}>
              <div className="photoOverlay">
                <p>Efate, Vanuatu</p>
                <strong>{mockFarm.crop}</strong>
              </div>
            </div>

            <div className="farmCardBody">
              <div className="sectionHeading">
                <div>
                  <p className="kicker">FARM OVERVIEW</p>
                  <h2>Field status</h2>
                </div>
                <span className="smallStatus">3 fields</span>
              </div>

              <div className="fieldRows">
                <FieldStatus name="Field 01" detail="North block" state="Healthy" tone="healthy" />
                <FieldStatus name="Field 02" detail="East block" state="Dry" tone="warning" />
                <FieldStatus name="Field 03" detail="South block" state="Inspect" tone="danger" />
              </div>

              <div className="sourceSummary">
                <div><span>Weather</span><strong>Connected</strong></div>
                <div><span>Soil sensor</span><strong>Demo feed</strong></div>
                <div><span>Satellite</span><strong>Demo NDVI</strong></div>
              </div>
            </div>
          </section>

          <p className="photoCredit">Farm photo: Bernd Dittrich / Unsplash</p>
        </aside>
      </main>
    </div>
  );
}

function Condition({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="conditionItem">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  );
}

function FieldStatus({
  name,
  detail,
  state,
  tone,
}: {
  name: string;
  detail: string;
  state: string;
  tone: "healthy" | "warning" | "danger";
}) {
  return (
    <div className="fieldRow">
      <div>
        <strong>{name}</strong>
        <span>{detail}</span>
      </div>
      <div className={`fieldState ${tone}`}>
        <span />
        {state}
      </div>
    </div>
  );
}

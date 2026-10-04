"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/lib/api";
import { buildRecommendations, Recommendation } from "@/lib/recommendations";
import { fieldHealth, mockSignals } from "@/lib/mocksignals";
import type { FieldDTO } from "@/types/farm";
import Navbar from "@/components/navbar";
import Condition from "@/components/condition";

type Weather = {
  next24h: { rainMm: number; et0Mm: number; vpdPeakKpa: number; tempPeakC: number };
  provider: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function FieldPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [field, setField] = useState<FieldDTO | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get<FieldDTO>(`/fields/${id}`)
      .then(({ data }) => setField(data))
      .catch((e) =>
        setFieldError(axios.isAxiosError(e) && e.response?.status === 404 ? "This field no longer exists." : "Could not load this field.")
      );
  }, [id]);

  useEffect(() => {
    if (!field) return;
    const controller = new AbortController();
    setWeather(null);
    setWeatherError(null);
    api
      .get<Weather>("/weather", {
        params: { lat: field.latitude, lon: field.longitude },
        signal: controller.signal,
      })
      .then(({ data }) => setWeather(data))
      .catch((e) => {
        if (!axios.isCancel(e)) setWeatherError("Weather is temporarily unavailable.");
      });
    return () => controller.abort();
  }, [field?.id]);

  const signals = useMemo(() => (field ? mockSignals(field.id) : null), [field]);

  const recommendations: Recommendation[] = useMemo(() => {
    if (!field || !signals) return [];
    return buildRecommendations({
      fieldId: field.id,
      fieldName: field.name,
      sensorSoilMoisturePct: signals.soilMoisturePct,
      rainNext24hMm: weather?.next24h.rainMm ?? 0.7,
      et0Next24hMm: weather?.next24h.et0Mm ?? 5.1,
      vpdPeakKpa: weather?.next24h.vpdPeakKpa ?? 1.8,
      ndviChangePct: signals.ndviChangePct,
    });
  }, [field, signals, weather]);

  async function handleDelete() {
    if (!field) return;
    if (!window.confirm(`Delete ${field.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/fields/${field.id}`);
      router.push("/");
    } catch {
      setDeleting(false);
      window.alert("Could not delete the field.");
    }
  }

  if (fieldError) {
    return (
      <div className="appShell">
        <Navbar farmName="My Farm" isOnline={false} />
        <main className="pageWrap">
          <div className="errorNotice">{fieldError}</div>
          <Link href="/dashboard" className="backLink">← Back to all fields</Link>
        </main>
      </div>
    );
  }

  if (!field || !signals) {
    return (
      <div className="appShell">
        <main className="pageWrap">
          <p className="subtle">Loading field…</p>
        </main>
      </div>
    );
  }

  const health = fieldHealth(signals.soilMoisturePct, signals.ndviChangePct);

  return (
    <div className="appShell">
      <Navbar farmName="My Farm" isOnline={!!weather} />

      <main className="workspace">
        <section className="mainColumn">
          <Link href="/dashboard" className="backLink">← All fields</Link>

          <div className="pageHeading">
            <div>
              <p className="kicker">TODAY · {field.name.toUpperCase()}</p>
              <h1>{recommendations.length} things to act on</h1>
              <p className="subtle">One place for the signals that actually need a decision.</p>
            </div>
          </div>

          {weatherError && (
            <div className="errorNotice">{weatherError} Demo fallback values are being used.</div>
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
            <Condition label="Soil moisture" value={`${signals.soilMoisturePct}%`} meta="sensor demo" />
            <Condition label="Rain · 24h" value={`${weather?.next24h.rainMm ?? "—"} mm`} meta="Open-Meteo" />
            <Condition label="ET₀ · 24h" value={`${weather?.next24h.et0Mm ?? "—"} mm`} meta="Open-Meteo" />
            <Condition label="NDVI change" value={`${signals.ndviChangePct}%`} meta="satellite demo" />
          </section>
        </section>

        <aside className="sideColumn">
          <section className="farmCard">
            <div className="farmCardBody">
              <div className="sectionHeading">
                <div>
                  <p className="kicker">FIELD DETAILS</p>
                  <h2>{field.name}</h2>
                </div>
                <div className={`fieldState ${health.tone}`}>
                  <span />
                  {health.state}
                </div>
              </div>

              <dl className="detailList">
                <div><dt>Crop</dt><dd>{field.crop}</dd></div>
                <div><dt>Area</dt><dd>{field.areaHa} ha</dd></div>
                <div><dt>Location</dt><dd>{field.placeLabel ?? "Custom location"}</dd></div>
                <div><dt>Coordinates</dt><dd>{field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}</dd></div>
                <div><dt>Irrigation</dt><dd>{field.irrigation}</dd></div>
                <div><dt>Soil type</dt><dd>{field.soilType ?? "Not set"}</dd></div>
                <div><dt>Planted</dt><dd>{field.plantingDate ? formatDate(field.plantingDate) : "Not set"}</dd></div>
                <div><dt>Added</dt><dd>{formatDate(field.createdAt)}</dd></div>
              </dl>

              {field.notes && <p className="fieldNotes">{field.notes}</p>}

              <div className="sourceSummary">
                <div><span>Weather</span><strong>{weather ? "Connected" : weatherError ? "Offline" : "Loading"}</strong></div>
                <div><span>Soil sensor</span><strong>Demo feed</strong></div>
                <div><span>Satellite</span><strong>Demo NDVI</strong></div>
              </div>

              <button className="dangerButton" disabled={deleting} onClick={handleDelete}>
                {deleting ? "Deleting…" : "Delete field"}
              </button>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
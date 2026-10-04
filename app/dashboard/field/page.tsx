"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { buildFarmRecommendations, type Recommendation } from "@/lib/recommendations";
import { makeField } from "@/lib/farm";
import LocationPicker from "@/components/locationpicker";
import Navbar from "@/components/navbar";
import RecommendationReview from "@/components/recommendation-review";
import { Farm, Field } from "@/types/farm";
import "../field-dashboard.css";

type Weather = {
  next24h: { rainMm: number; et0Mm: number; vpdPeakKpa: number; tempPeakC: number };
  provider: string;
};

type Tone = "healthy" | "warning" | "danger";

const FARM_IMAGE =
  "https://images.unsplash.com/photo-1777063012816-35f5bcbe4e09?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000";

function fieldHealth(f: Field): { state: string; tone: Tone } {
  if (f.soilMoisturePct < 20) return { state: "Dry", tone: "warning" };
  if (f.ndviChangePct < -10) return { state: "Inspect", tone: "danger" };
  return { state: "Healthy", tone: "healthy" };
}

export default function FieldPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [customFields, setCustomFields] = useState<Field[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [weatherByField, setWeatherByField] = useState<Record<string, Weather>>({});
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [farmError, setFarmError] = useState<string | null>(null);
  const [sensorMoisture, setSensorMoisture] = useState<Record<string, number>>({});
  const [reviewRec, setReviewRec] = useState<Recommendation | null>(null);

  useEffect(() => {
    api
      .get<Farm>("/farms")
      .then(({ data }) => setFarm(data))
      .catch(() => setFarmError("Could not load the farm."));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customFields");
      if (raw) {
        const saved = JSON.parse(raw) as Field[];
        setCustomFields(saved);
        if (saved.length > 0) setFieldId(saved[saved.length - 1].id);
      }
    } catch {
      // ignore corrupted storage
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (storageReady) {
      localStorage.setItem("customFields", JSON.stringify(customFields));
    }
  }, [customFields, storageReady]);

  const allFields = useMemo(
    () => [...(farm?.fields ?? []), ...customFields],
    [farm, customFields]
  );

  const fieldsWithSensor = useMemo(
    () =>
      allFields.map((f) => ({
        ...f,
        soilMoisturePct: sensorMoisture[f.id] ?? f.soilMoisturePct,
      })),
    [allFields, sensorMoisture]
  );

  const field =
    fieldsWithSensor.find((f) => f.id === fieldId) ?? fieldsWithSensor[0] ?? null;

  function handleAdd(lat: number, lon: number, label: string) {
    const newField = makeField(label, lat, lon);
    setCustomFields((prev) => [...prev, newField]);
    setFieldId(newField.id);
    setPickerOpen(false);
  }

  useEffect(() => {
    if (!allFields.length) return;
    const controller = new AbortController();
    setWeatherError(null);

    allFields.forEach((f) => {
      api
        .get<Weather>("/weather", {
          params: { lat: f.lat, lon: f.lon },
          signal: controller.signal,
        })
        .then(({ data }) =>
          setWeatherByField((prev) => ({
            ...prev,
            [f.id]: data,
          }))
        )
        .catch((e) => {
          if (!axios.isCancel(e)) setWeatherError("Weather is temporarily unavailable.");
        });
    });

    return () => controller.abort();
  }, [allFields]);

  useEffect(() => {
    if (!field) return;
    api
      .get<{ soil_moisture_pct: number }>("/sensors", { params: { fieldId: field.id } })
      .then(({ data }) =>
        setSensorMoisture((prev) => ({ ...prev, [field.id]: data.soil_moisture_pct }))
      )
      .catch(() => {
        // keep field defaults for custom locations
      });
  }, [field?.id]);

  const weather = field ? weatherByField[field.id] ?? null : null;

  const recommendations: Recommendation[] = useMemo(() => {
    if (!fieldsWithSensor.length) return [];
    return buildFarmRecommendations(
      fieldsWithSensor,
      (id) => {
        const wx = weatherByField[id];
        if (!wx) return null;
        return {
          rainMm: wx.next24h.rainMm,
          et0Mm: wx.next24h.et0Mm,
          vpdPeakKpa: wx.next24h.vpdPeakKpa,
          tempPeakC: wx.next24h.tempPeakC,
        };
      },
      3
    );
  }, [fieldsWithSensor, weatherByField]);

  if (farmError) {
    return (
      <div className="fieldDashboard">
        <div className="appShell">
          <div className="errorNotice">{farmError} Please refresh.</div>
        </div>
      </div>
    );
  }

  if (!farm || !field) {
    return (
      <div className="fieldDashboard">
        <div className="appShell">
          <p className="subtle">Loading your farm…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fieldDashboard">
      <div className="appShell">
        <Navbar farmName={farm.name} isOnline={Object.keys(weatherByField).length > 0} activeTab="today" />

        <main className="workspace">
          <section className="mainColumn">
            <div className="pageHeading">
              <div>
                <p className="kicker">TODAY</p>
                <h1>
                  {recommendations.length} thing{recommendations.length === 1 ? "" : "s"} need
                  your attention
                </h1>
                <p className="subtle">
                  Farm-wide priorities from weather, soil sensors and satellite (demo) signals.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="secondaryButton" onClick={() => setPickerOpen(true)}>
                  Add location
                </button>
                <button className="secondaryButton" onClick={() => location.reload()}>
                  Refresh
                </button>
              </div>
            </div>

            {weatherError && (
              <div className="errorNotice">
                {weatherError} Demo fallback values are being used.
              </div>
            )}

            <div className="actionList">
              {recommendations.map((item) => (
                <article key={item.id} className="actionRow">
                  <div
                    className={`priorityDot ${item.priority}`}
                    aria-label={`${item.priority} priority`}
                  />
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
                  <button
                    type="button"
                    className="reviewButton"
                    onClick={() => {
                      setReviewRec(item);
                      setFieldId(item.fieldId);
                    }}
                  >
                    Review
                  </button>
                </article>
              ))}
            </div>

            <section className="conditions" aria-label="Current conditions">
              <Condition
                label="Soil moisture"
                value={`${field.soilMoisturePct}%`}
                meta={sensorMoisture[field.id] != null ? "/api/sensors" : "sensor demo"}
              />
              <Condition
                label="Rain · 24h"
                value={`${weather?.next24h.rainMm ?? "—"} mm`}
                meta="Open-Meteo"
              />
              <Condition
                label="ET₀ · 24h"
                value={`${weather?.next24h.et0Mm ?? "—"} mm`}
                meta="Open-Meteo"
              />
              <Condition
                label="NDVI change"
                value={`${field.ndviChangePct}%`}
                meta="satellite demo"
              />
            </section>
          </section>

          <aside className="sideColumn">
            <section className="farmCard">
              <div
                className="farmPhoto"
                style={{ backgroundImage: `url(${FARM_IMAGE})` }}
              >
                <div className="photoOverlay">
                  <p>{field.name}</p>
                  <strong>{farm.crop}</strong>
                </div>
              </div>

              <div className="farmCardBody">
                <div className="sectionHeading">
                  <div>
                    <p className="kicker">FARM OVERVIEW</p>
                    <h2>Field status</h2>
                  </div>
                  <span className="smallStatus">{allFields.length} fields</span>
                </div>

                <div className="fieldRows">
                  {allFields.map((f) => {
                    const health = fieldHealth(f);
                    return (
                      <button
                        key={f.id}
                        className={`fieldRowButton ${f.id === field.id ? "selected" : ""}`}
                        onClick={() => setFieldId(f.id)}
                      >
                        <FieldStatus
                          name={f.name}
                          detail={f.detail}
                          state={health.state}
                          tone={health.tone}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="sourceSummary">
                  <div>
                    <span>Weather</span>
                    <strong>
                      {weather ? "Connected" : weatherError ? "Offline" : "Loading"}
                    </strong>
                  </div>
                  <div>
                    <span>Soil sensor</span>
                    <strong>Demo feed</strong>
                  </div>
                  <div>
                    <span>Satellite</span>
                    <strong>Demo NDVI</strong>
                  </div>
                </div>
              </div>
            </section>

            <p className="photoCredit">Farm photo: Bernd Dittrich / Unsplash</p>
          </aside>
        </main>

        {pickerOpen && (
          <LocationPicker onSelect={handleAdd} onClose={() => setPickerOpen(false)} />
        )}

        <RecommendationReview recommendation={reviewRec} onClose={() => setReviewRec(null)} />
      </div>
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
  tone: Tone;
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

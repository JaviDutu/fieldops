"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { fieldHealth, mockSignals } from "@/lib/mocksignals";
import type { FieldDTO } from "@/types/farm";
import Navbar from "@/components/navbar";
import NewFieldModal from "@/components/newfieldwizard";

type Payload = { farmName: string; fields: FieldDTO[] };

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api
      .get<Payload>("/fields")
      .then(({ data }) => setData(data))
      .catch(() => setError("Could not load your fields."));
  }, []);

  const summary = useMemo(() => {
    const fields = data?.fields ?? [];
    const totalArea = fields.reduce((sum, f) => sum + f.areaHa, 0);
    const attention = fields.filter((f) => {
      const s = mockSignals(f.id);
      return fieldHealth(s.soilMoisturePct, s.ndviChangePct).tone !== "healthy";
    }).length;
    return { count: fields.length, totalArea, attention };
  }, [data]);

  if (error) {
    return (
      <div className="appShell">
        <main className="pageWrap">
          <div className="errorNotice">{error} Please refresh.</div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="appShell">
        <main className="pageWrap">
          <p className="subtle">Loading your farm…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="appShell">
      <Navbar farmName={data.farmName} isOnline />

      <main className="pageWrap">
        <div className="pageHeading">
          <div>
            <p className="kicker">YOUR FARM</p>
            <h1>Your fields</h1>
            <p className="subtle">Open a field to see what needs doing today.</p>
          </div>
          <button className="reviewButton" onClick={() => setModalOpen(true)}>Add field</button>
        </div>

        <section className="summaryStrip" aria-label="Farm summary">
          <div><span>Fields</span><strong>{summary.count}</strong></div>
          <div><span>Total area</span><strong>{summary.totalArea.toFixed(1)} ha</strong></div>
          <div><span>Need attention</span><strong>{summary.attention}</strong></div>
        </section>

        {data.fields.length === 0 ? (
          <div className="emptyState">
            <h2>No fields yet</h2>
            <p className="subtle">Add your first field to get weather, soil and satellite guidance for it.</p>
            <button className="reviewButton" onClick={() => setModalOpen(true)}>Add your first field</button>
          </div>
        ) : (
          <div className="fieldGrid">
            {data.fields.map((f) => {
              const s = mockSignals(f.id);
              const health = fieldHealth(s.soilMoisturePct, s.ndviChangePct);
              return (
                <Link key={f.id} href={`/dashboard/fields/${f.id}`} className="fieldCard">
                  <div className="fieldCardTop">
                    <h2>{f.name}</h2>
                    <div className={`fieldState ${health.tone}`}>
                      <span />
                      {health.state}
                    </div>
                  </div>
                  <p className="subtle">{f.crop} · {f.areaHa} ha</p>
                  <p className="fieldPlace">{f.placeLabel ?? `${f.latitude.toFixed(3)}, ${f.longitude.toFixed(3)}`}</p>
                  <div className="fieldCardMeta">
                    <span>Soil {s.soilMoisturePct}%</span>
                    <span>NDVI {s.ndviChangePct > 0 ? "+" : ""}{s.ndviChangePct}%</span>
                    <span>{f.irrigation}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {modalOpen && (
        <NewFieldModal
          onClose={() => setModalOpen(false)}
          onCreated={(field) => router.push(`/dashboard/fields/${field.id}`)}
        />
      )}
    </div>
  );
}
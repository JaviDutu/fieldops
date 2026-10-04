"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Result = { id: number; name: string; admin: string | null; country: string | null; lat: number; lon: number };

type Props = {
  onSelect: (lat: number, lon: number, label: string) => void;
  onClose: () => void;
};

export default function LocationPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSearch() {
    if (query.trim().length < 2) return;
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await api.get<{ results: Result[] }>("/geocode", { params: { q: query } });
      setResults(data.results);
      if (data.results.length === 0) setMessage("No places found. Try a nearby town.");
    } catch {
      setMessage("Search is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location.");
      return;
    }
    setBusy(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        onSelect(pos.coords.latitude, pos.coords.longitude, "My location");
      },
      () => {
        setBusy(false);
        setMessage("Location permission was declined. You can search for a place instead.");
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="pickerBackdrop" onClick={onClose}>
      <div className="pickerCard" onClick={(e) => e.stopPropagation()}>
        <div className="sectionHeading">
          <div>
            <p className="kicker">ADD LOCATION</p>
            <h2>Where is your field?</h2>
          </div>
          <button className="secondaryButton" onClick={onClose}>Close</button>
        </div>

        <button className="reviewButton" disabled={busy} onClick={handleUseLocation}>
          Use my current location
        </button>

        <div className="pickerSearch">
          <input
            value={query}
            placeholder="Search a village or town"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="secondaryButton" disabled={busy} onClick={handleSearch}>Search</button>
        </div>

        {message && <p className="subtle">{message}</p>}

        <div className="pickerResults">
          {results.map((r) => {
            const label = [r.name, r.admin].filter(Boolean).join(", ");
            return (
              <button key={r.id} className="pickerResult" onClick={() => onSelect(r.lat, r.lon, label)}>
                <strong>{label}</strong>
                <span>{r.country}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
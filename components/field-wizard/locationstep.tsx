"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Crosshair, Loader2, MapPin, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import type { PickedLocation } from "@/lib/fieldForm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Result = {
  id: number;
  name: string;
  admin: string | null;
  country: string | null;
  lat: number;
  lon: number;
};

type Props = {
  value: PickedLocation | null;
  onChange: (value: PickedLocation | null) => void;
  error?: string;
};

export default function LocationStep({ value, onChange, error }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);

  const handleSearch = useCallback(
    async (raw?: string) => {
      const term = (raw ?? query).trim();

      if (term.length < 2) {
        setResults([]);
        setMessage(term.length === 1 ? "Enter at least 2 characters." : null);
        return;
      }

      const requestId = ++requestRef.current;
      setBusy(true);
      setMessage(null);

      try {
        const { data } = await api.get<{ results: Result[] }>("/geocode", { params: { q: term } });
        if (requestId !== requestRef.current) return; // a newer search has started
        setResults(data.results);
        if (data.results.length === 0) setMessage("No places found. Try a nearby town or city.");
      } catch {
        if (requestId !== requestRef.current) return;
        setResults([]);
        setMessage("Search is unavailable right now. Please try again.");
      } finally {
        if (requestId === requestRef.current) setBusy(false);
      }
    },
    [query]
  );

  // Debounced search while typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = query.trim();

    if (term.length < 3) {
      if (!term) {
        setResults([]);
        setMessage(null);
      }
      return;
    }

    debounceRef.current = setTimeout(() => handleSearch(term), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  useEffect(() => {
    if (value) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [value]);

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location services.");
      return;
    }

    setLocating(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setResults([]);
        onChange({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: "My current location",
        });
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setMessage("Location permission was declined. Search for your field instead.");
            break;
          case err.POSITION_UNAVAILABLE:
            setMessage("Your current location could not be determined.");
            break;
          case err.TIMEOUT:
            setMessage("Location detection timed out. Please try again.");
            break;
          default:
            setMessage("We couldn't determine your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function handleSelect(result: Result) {
    const label = [result.name, result.admin, result.country].filter(Boolean).join(", ");
    setResults([]);
    setQuery("");
    onChange({ lat: result.lat, lon: result.lon, label });
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setMessage(null);
    inputRef.current?.focus();
  }

  // A location has been chosen
  if (value) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
            <Check className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-emerald-900">{value.label}</p>
            <p className="mt-0.5 font-mono text-[11px] text-emerald-700/70">
              {value.lat.toFixed(4)}°, {value.lon.toFixed(4)}°
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>
            Change
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Weather and satellite data will be pulled for these coordinates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Button
        type="button"
        variant="outline"
        disabled={locating}
        onClick={handleUseLocation}
        className="h-auto w-full justify-start gap-3 rounded-xl border-emerald-200 bg-emerald-50/60 px-4 py-3.5 text-left hover:bg-emerald-50"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
          {locating ? <Loader2 className="size-5 animate-spin" /> : <Crosshair className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-emerald-900">
            {locating ? "Finding your location..." : "Use my current location"}
          </div>
          <div className="mt-0.5 truncate text-xs text-emerald-700/70">
            Allow DEMETER to use your device location
          </div>
        </div>
        {!locating && <span className="text-emerald-700">→</span>}
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">OR SEARCH</span>
        <Separator className="flex-1" />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          placeholder="Search a village, town or city"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="h-12 rounded-xl pl-10 pr-24"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-20 top-1/2 size-7 -translate-y-1/2 rounded-md text-muted-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </Button>
        )}
        <Button
          type="button"
          disabled={busy || query.trim().length < 2}
          onClick={() => handleSearch()}
          size="sm"
          className="absolute right-1 top-1/2 h-10 -translate-y-1/2 rounded-lg px-4"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {message && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800" role="status">
          {message}
        </div>
      )}

      {error && !message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      <div className="min-h-[160px]">
        {busy && results.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="size-10 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-1/4 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">LOCATIONS</span>
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {results.length} found
              </Badge>
            </div>
            <div className="max-h-[240px] space-y-1.5 overflow-y-auto pr-1 sm:max-h-[320px]">
              {results.map((result) => {
                const label = [result.name, result.admin].filter(Boolean).join(", ");
                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-border hover:bg-muted/50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MapPin className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{label}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {result.country ?? "Unknown country"}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="font-mono text-[10px] text-muted-foreground">{result.lat.toFixed(3)}°</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{result.lon.toFixed(3)}°</p>
                    </div>
                    <span className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Search className="size-5" />
            </div>
            <p className="text-sm font-medium">Find your field</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Search for a village, town or city to connect it with DEMETER.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
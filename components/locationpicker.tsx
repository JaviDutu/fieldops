"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Check,
  Crosshair,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";

type Result = {
  id: number;
  name: string;
  admin: string | null;
  country: string | null;
  lat: number;
  lon: number;
};

type Props = {
  onSelect: (lat: number, lon: number, label: string) => void;
  onClose: () => void;
};

export default function LocationPicker({
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /*
   * Search locations.
   */
  const handleSearch = useCallback(
    async (value?: string) => {
      const searchValue = (value ?? query).trim();

      if (searchValue.length < 2) {
        setResults([]);
        setMessage(
          searchValue.length === 1
            ? "Enter at least 2 characters."
            : null
        );
        return;
      }

      setBusy(true);
      setMessage(null);
      setSelectedId(null);

      try {
        const { data } = await api.get<{
          results: Result[];
        }>("/geocode", {
          params: {
            q: searchValue,
          },
        });

        setResults(data.results);

        if (data.results.length === 0) {
          setMessage(
            "No places found. Try a nearby town or city."
          );
        }
      } catch {
        setResults([]);
        setMessage(
          "Search is unavailable right now. Please try again."
        );
      } finally {
        setBusy(false);
      }
    },
    [query]
  );

  /*
   * Debounced search.
   */
  useEffect(() => {
    const value = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 3) {
      if (!value) {
        setResults([]);
        setMessage(null);
      }

      return;
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  /*
   * Focus search input when opened.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  /*
   * Current location.
   */
  function handleUseLocation() {
    if (!navigator.geolocation) {
      setMessage(
        "Your browser does not support location services."
      );
      return;
    }

    setBusy(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        onSelect(
          latitude,
          longitude,
          "My current location"
        );
      },
      (error) => {
        setBusy(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setMessage(
              "Location permission was declined. Search for your field instead."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setMessage(
              "Your current location could not be determined."
            );
            break;

          case error.TIMEOUT:
            setMessage(
              "Location detection timed out. Please try again."
            );
            break;

          default:
            setMessage(
              "We couldn't determine your location."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  /*
   * Select location.
   */
  function handleSelect(result: Result) {
    const label = [
      result.name,
      result.admin,
      result.country,
    ]
      .filter(Boolean)
      .join(", ");

    setSelectedId(result.id);

    setTimeout(() => {
      onSelect(result.lat, result.lon, label);
    }, 150);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setMessage(null);
    inputRef.current?.focus();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-2xl
          overflow-hidden
          rounded-2xl
          border
          p-0
          shadow-2xl

          sm:w-full
        "
      >
        {/* Header */}
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                size-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-700
              "
            >
              <MapPin className="size-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-xl tracking-tight">
                Where is your field?
              </DialogTitle>

              <DialogDescription className="mt-1 max-w-lg text-sm leading-relaxed">
                Choose a location to connect weather,
                soil and satellite intelligence to your
                field.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {/* Current location */}
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleUseLocation}
            className="
              h-auto
              w-full
              justify-start
              gap-3
              rounded-xl
              border-emerald-200
              bg-emerald-50/60
              px-4
              py-3.5
              text-left
              hover:bg-emerald-50
            "
          >
            <div
              className="
                flex
                size-10
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-white
                text-emerald-700
                shadow-sm
              "
            >
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Crosshair className="size-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-medium text-emerald-900">
                {busy
                  ? "Finding your location..."
                  : "Use my current location"}
              </div>

              <div className="mt-0.5 truncate text-xs text-emerald-700/70">
                Allow DEMETER to use your device location
              </div>
            </div>

            {!busy && (
              <span className="text-emerald-700">
                →
              </span>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />

            <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">
              OR SEARCH
            </span>

            <Separator className="flex-1" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                size-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <Input
              ref={inputRef}
              value={query}
              placeholder="Search a village, town or city"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              className="
                h-12
                rounded-xl
                pl-10
                pr-24
              "
            />

            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="
                  absolute
                  right-20
                  top-1/2
                  size-7
                  -translate-y-1/2
                  rounded-md
                  text-muted-foreground
                "
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
              className="
                absolute
                right-1
                top-1/2
                h-10
                -translate-y-1/2
                rounded-lg
                px-4
              "
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div
              className="
                rounded-lg
                border
                border-amber-200
                bg-amber-50
                px-3
                py-2.5
                text-sm
                text-amber-800
              "
              role="status"
            >
              {message}
            </div>
          )}

          {/* Results */}
          <div className="min-h-[180px]">
            {busy && results.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      p-3
                    "
                  >
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
                  <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">
                    LOCATIONS
                  </span>

                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px]"
                  >
                    {results.length} found
                  </Badge>
                </div>

                <div className="max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
                  {results.map((result) => {
                    const label = [
                      result.name,
                      result.admin,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    const selected =
                      selectedId === result.id;

                    return (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() =>
                          handleSelect(result)
                        }
                        className={`
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          border
                          p-3
                          text-left
                          transition-all

                          ${
                            selected
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-transparent hover:border-border hover:bg-muted/50"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            size-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg

                            ${
                              selected
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-muted text-muted-foreground"
                            }
                          `}
                        >
                          {selected ? (
                            <Check className="size-4" />
                          ) : (
                            <MapPin className="size-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {label}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {result.country ??
                              "Unknown country"}
                          </p>
                        </div>

                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {result.lat.toFixed(3)}°
                          </p>

                          <p className="font-mono text-[10px] text-muted-foreground">
                            {result.lon.toFixed(3)}°
                          </p>
                        </div>

                        <span
                          className="
                            text-muted-foreground/40
                            transition-transform
                            group-hover:translate-x-0.5
                            group-hover:text-foreground
                          "
                        >
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className="
                  flex
                  min-h-[180px]
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-dashed
                  bg-muted/20
                  px-6
                  text-center
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    size-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-muted
                    text-muted-foreground
                  "
                >
                  <Search className="size-5" />
                </div>

                <p className="text-sm font-medium">
                  Find your field
                </p>

                <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  Search for a village, town or city to
                  connect it with DEMETER.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Geospatial data
          </div>

          <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
            Press
            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[9px]">
              ESC
            </kbd>
            to close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
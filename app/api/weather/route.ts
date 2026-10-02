import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat") ?? "-17.7333");
  const lon = Number(request.nextUrl.searchParams.get("lon") ?? "168.3273");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "precipitation",
      "et0_fao_evapotranspiration",
      "vapour_pressure_deficit",
      "temperature_2m",
    ].join(","),
    forecast_days: "2",
    timezone: "auto",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Weather provider unavailable" }, { status: 502 });
  }

  const data = await response.json();
  const now = Date.now();
  const rows = (data.hourly?.time ?? []).map((time: string, i: number) => ({
    time,
    ts: new Date(time).getTime(),
    precipitation: Number(data.hourly.precipitation?.[i] ?? 0),
    et0: Number(data.hourly.et0_fao_evapotranspiration?.[i] ?? 0),
    vpd: Number(data.hourly.vapour_pressure_deficit?.[i] ?? 0),
    temperature: Number(data.hourly.temperature_2m?.[i] ?? 0),
  }));

  const next24 = rows.filter((r: { ts: number }) => r.ts >= now - 3600000 && r.ts <= now + 24 * 3600000);
  const sum = (key: "precipitation" | "et0") => next24.reduce((acc: number, r: any) => acc + r[key], 0);
  const max = (key: "vpd" | "temperature") => Math.max(...next24.map((r: any) => r[key]), 0);

  return NextResponse.json({
    location: { latitude: lat, longitude: lon, timezone: data.timezone },
    next24h: {
      rainMm: Number(sum("precipitation").toFixed(1)),
      et0Mm: Number(sum("et0").toFixed(1)),
      vpdPeakKpa: Number(max("vpd").toFixed(1)),
      tempPeakC: Number(max("temperature").toFixed(1)),
    },
    provider: "Open-Meteo",
  });
}

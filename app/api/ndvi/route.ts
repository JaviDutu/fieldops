import { NextRequest, NextResponse } from "next/server";
import { getFarm } from "@/lib/farm";
import type { LonLat } from "@/types/farm";

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
const STATS_URL = "https://sh.dataspace.copernicus.eu/statistics/v1";

let tokenCache: { token: string; expiresAt: number } | null = null;

const evalscript = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "SCL", "dataMask"] }],
    output: [
      { id: "data", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(sample) {
  const denominator = sample.B08 + sample.B04;
  const ndvi = denominator === 0 ? 0 : (sample.B08 - sample.B04) / denominator;
  const cloudOrInvalid = [3, 8, 9, 10, 11].includes(sample.SCL);
  return {
    data: [ndvi],
    dataMask: [sample.dataMask * (denominator === 0 || cloudOrInvalid ? 0 : 1)]
  };
}`;

function squareAround(lat: number, lon: number, d = 0.0015): LonLat[] {
  return [
    [lon - d, lat - d],
    [lon + d, lat - d],
    [lon + d, lat + d],
    [lon - d, lat + d],
    [lon - d, lat - d],
  ];
}

async function getToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const clientId = process.env.COPERNICUS_CLIENT_ID;
  const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Copernicus auth failed: ${response.status}`);
  const data = (await response.json()) as { access_token: string; expires_in?: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 600) * 1000,
  };
  return data.access_token;
}

function demoResponse(fieldId: string, ndviChangePct: number) {
  const ndviMean =
    ndviChangePct <= -10 ? 0.48 : ndviChangePct < 0 ? 0.62 : 0.72;

  return {
    field_id: fieldId,
    provider: "Sentinel-2 adapter",
    status: "demo",
    ndvi_mean: ndviMean,
    ndvi_change_pct: ndviChangePct,
    comparison_period_days: 14,
    note: "Demo statistics. Add Copernicus OAuth credentials to switch this endpoint to live Sentinel-2 data.",
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const fieldId = request.nextUrl.searchParams.get("fieldId");
  if (!fieldId) {
    return NextResponse.json({ error: "fieldId is required" }, { status: 400 });
  }

  const farm = await getFarm();
  const field = farm.fields.find((f) => f.id === fieldId);
  const fallbackChange = field?.ndviChangePct ?? 0;

  const lat = Number(request.nextUrl.searchParams.get("lat") ?? field?.lat);
  const lon = Number(request.nextUrl.searchParams.get("lon") ?? field?.lon);
  const polygon = field?.polygon ?? (Number.isFinite(lat) && Number.isFinite(lon) ? squareAround(lat, lon) : null);

  if (!polygon) return NextResponse.json(demoResponse(fieldId, fallbackChange));

  try {
    const token = await getToken();
    if (!token) return NextResponse.json(demoResponse(fieldId, fallbackChange));

    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - 28);

    const response = await fetch(STATS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        input: {
          bounds: {
            geometry: { type: "Polygon", coordinates: [polygon] },
            properties: {
              crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
            },
          },
          data: [
            {
              type: "sentinel-2-l2a",
              dataFilter: { mosaickingOrder: "leastCC" },
            },
          ],
        },
        aggregation: {
          timeRange: { from: from.toISOString(), to: to.toISOString() },
          aggregationInterval: { of: "P14D" },
          evalscript,
          resx: 10,
          resy: 10,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Copernicus stats failed: ${response.status}`);
    const data = (await response.json()) as {
      data?: Array<{
        outputs?: {
          data?: {
            bands?: {
              B0?: { stats?: { mean?: number; noDataCount?: number; sampleCount?: number } };
            };
          };
        };
      }>;
    };

    const means =
      data.data
        ?.map((entry) => entry.outputs?.data?.bands?.B0?.stats?.mean)
        .filter((value): value is number => Number.isFinite(value)) ?? [];

    if (!means.length) throw new Error("No usable NDVI statistics returned");

    const recent = means[means.length - 1];
    const previous = means.length > 1 ? means[means.length - 2] : recent;
    const changePct = previous === 0 ? 0 : ((recent - previous) / Math.abs(previous)) * 100;

    return NextResponse.json({
      field_id: fieldId,
      provider: "Copernicus Sentinel-2",
      status: "live",
      ndvi_mean: Number(recent.toFixed(3)),
      ndvi_change_pct: Number(changePct.toFixed(1)),
      comparison_period_days: 14,
      intervals_used: means.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("NDVI adapter fallback:", error);
    return NextResponse.json(demoResponse(fieldId, fallbackChange));
  }
}

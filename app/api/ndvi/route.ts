import { NextRequest, NextResponse } from "next/server";
import { getFarm } from "@/lib/farm";

/**
 * Demo NDVI / vegetation signal. Planned replacement: Copernicus Sentinel-2
 * via Sentinel Hub Statistical API (see docs/THIRD_PARTY_AND_APIS.md).
 */
export async function GET(request: NextRequest) {
  const fieldId = request.nextUrl.searchParams.get("fieldId");
  if (!fieldId) {
    return NextResponse.json({ error: "fieldId is required" }, { status: 400 });
  }

  const farm = await getFarm();
  const field = farm.fields.find((f) => f.id === fieldId);

  const ndviChangePct = field?.ndviChangePct ?? 0;
  const ndviIndex = field
    ? ndviChangePct <= -10
      ? 0.48
      : ndviChangePct < 0
        ? 0.62
        : 0.72
    : 0.65;

  return NextResponse.json({
    field_id: fieldId,
    provider: "Sentinel-2 (demo)",
    status: "demo",
    ndvi_mean: ndviIndex,
    ndvi_change_pct: ndviChangePct,
    comparison_period_days: 14,
    note: "Mock statistics until Copernicus Sentinel Hub credentials are configured.",
    timestamp: new Date().toISOString(),
  });
}

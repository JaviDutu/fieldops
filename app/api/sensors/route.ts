import { NextRequest, NextResponse } from "next/server";
import { getFarm } from "@/lib/farm";

/**
 * Demo soil-moisture sensor feed. Returns a vendor-shaped payload so the UI
 * can later swap MQTT/webhook data without changing the contract.
 */
export async function GET(request: NextRequest) {
  const fieldId = request.nextUrl.searchParams.get("fieldId");
  if (!fieldId) {
    return NextResponse.json({ error: "fieldId is required" }, { status: 400 });
  }

  const farm = await getFarm();
  const field = farm.fields.find((f) => f.id === fieldId);

  const soilMoisturePct = field?.soilMoisturePct ?? 28;
  const fieldName = field?.name ?? "Custom field";

  return NextResponse.json({
    device_id: `soil-${fieldId}`,
    field_id: fieldId,
    field_name: fieldName,
    soil_moisture_pct: soilMoisturePct,
    unit: "percent_volumetric_demo",
    provider: "Soil sensor (demo)",
    status: field ? "demo" : "demo_fallback",
    timestamp: new Date().toISOString(),
  });
}

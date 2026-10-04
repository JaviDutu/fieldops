import { NextRequest, NextResponse } from "next/server";
import { createField, listFields } from "@/lib/store";
import { parseNewField } from "@/lib/validate";

export async function GET() {
  const { farmName, fields } = await listFields();
  return NextResponse.json({ farmName, fields });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseNewField(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const d = parsed.data;
  const created = await createField({
    name: d.name,
    crop: d.crop,
    areaHa: d.areaHa,
    latitude: d.latitude,
    longitude: d.longitude,
    placeLabel: d.placeLabel ?? null,
    irrigation: d.irrigation,
    soilType: d.soilType ?? null,
    plantingDate: d.plantingDate ? new Date(d.plantingDate).toISOString() : null,
    notes: d.notes ?? null,
  });

  return NextResponse.json(created, { status: 201 });
}

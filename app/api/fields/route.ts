import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultFarm } from "@/lib/farm";
import { toDTO } from "@/lib/serialize";
import { parseNewField } from "@/lib/validate";
import { squareParcel } from "@/lib/geo";

export async function GET() {
  const farm = await getDefaultFarm();
  const fields = await prisma.field.findMany({
    where: { farmId: farm.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ farmName: farm.name, fields: fields.map(toDTO) });
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
  const farm = await getDefaultFarm();

  const created = await prisma.field.create({
    data: {
      farmId: farm.id,
      name: d.name,
      crop: d.crop,
      areaHa: d.areaHa,
      latitude: d.latitude,
      longitude: d.longitude,
      placeLabel: d.placeLabel ?? null,
      polygon: JSON.stringify(squareParcel(d.latitude, d.longitude, d.areaHa)),
      irrigation: d.irrigation,
      soilType: d.soilType ?? null,
      plantingDate: d.plantingDate ? new Date(d.plantingDate) : null,
      notes: d.notes ?? null,
    },
  });

  return NextResponse.json(toDTO(created), { status: 201 });
}
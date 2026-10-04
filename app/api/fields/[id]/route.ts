import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateFarmForUser } from "@/lib/farm";
import { toDTO } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const farm = await getOrCreateFarmForUser(user.id);
  const field = await prisma.field.findFirst({ where: { id, farmId: farm.id } });
  if (!field) return NextResponse.json({ error: "Field not found." }, { status: 404 });
  return NextResponse.json(toDTO(field));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const farm = await getOrCreateFarmForUser(user.id);
  const result = await prisma.field.deleteMany({ where: { id, farmId: farm.id } });
  if (result.count === 0) return NextResponse.json({ error: "Field not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
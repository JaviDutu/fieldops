import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDTO } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const field = await prisma.field.findUnique({ where: { id } });
  if (!field) return NextResponse.json({ error: "Field not found." }, { status: 404 });
  return NextResponse.json(toDTO(field));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.field.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Field not found." }, { status: 404 });
  }
}
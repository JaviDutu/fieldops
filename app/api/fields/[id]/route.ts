import { NextRequest, NextResponse } from "next/server";
import { deleteField, getField } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const field = await getField(id);
  if (!field) return NextResponse.json({ error: "Field not found." }, { status: 404 });
  return NextResponse.json(field);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const deleted = await deleteField(id);
  if (!deleted) return NextResponse.json({ error: "Field not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

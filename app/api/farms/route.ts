import { NextResponse } from "next/server";
import { getFarm } from "@/lib/farm";

export async function GET() {
  const farm = await getFarm();
  return NextResponse.json(farm);
}
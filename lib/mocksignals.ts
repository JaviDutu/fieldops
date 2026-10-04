function hash(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function mockSignals(id: string) {
  const h = hash(id);
  return {
    soilMoisturePct: 14 + (h % 25), // 14 to 38
    ndviChangePct: ((h >> 3) % 21) - 14, // -14 to +6
  };
}

export type Tone = "healthy" | "warning" | "danger";

export function fieldHealth(soilMoisturePct: number, ndviChangePct: number): { state: string; tone: Tone } {
  if (soilMoisturePct < 20) return { state: "Dry", tone: "warning" };
  if (ndviChangePct < -10) return { state: "Inspect", tone: "danger" };
  return { state: "Healthy", tone: "healthy" };
}
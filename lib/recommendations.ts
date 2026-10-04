export type Priority = "high" | "medium" | "low";

export type FarmInputs = {
  fieldId: string;
  fieldName: string;
  fieldDetail?: string;
  sensorSoilMoisturePct: number;
  rainNext24hMm: number;
  et0Next24hMm: number;
  vpdPeakKpa: number;
  tempPeakC?: number;
  ndviChangePct?: number;
};

export type Recommendation = {
  id: string;
  fieldId: string;
  fieldName: string;
  priority: Priority;
  title: string;
  reason: string;
  action: string;
  when: string;
  where: string;
  confidence: number;
  signals: string[];
  source: string[];
};

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function buildRecommendations(input: FarmInputs): Recommendation[] {
  const out: Recommendation[] = [];
  const where = input.fieldDetail
    ? `${input.fieldName} (${input.fieldDetail})`
    : input.fieldName;

  if (input.sensorSoilMoisturePct < 28 && input.rainNext24hMm < 2) {
    const confidence = Math.min(
      95,
      72 +
        (28 - input.sensorSoilMoisturePct) +
        (2 - input.rainNext24hMm) * 5 +
        (input.vpdPeakKpa > 1.6 ? 8 : 0)
    );
    out.push({
      id: `${input.fieldId}-irrigation`,
      fieldId: input.fieldId,
      fieldName: input.fieldName,
      priority: input.sensorSoilMoisturePct < 20 ? "high" : "high",
      title: `Irrigate ${input.fieldName}`,
      reason: `Soil moisture is ${input.sensorSoilMoisturePct}% (below the demo threshold). Only ${input.rainNext24hMm.toFixed(1)} mm of rain is expected in the next 24h.`,
      action:
        "Inspect the driest zone, then schedule irrigation for the coolest part of the day (evening or early morning).",
      when: "Within the next 12 hours",
      where,
      confidence: Math.round(confidence),
      signals: [
        `Soil moisture: ${input.sensorSoilMoisturePct}%`,
        `Rain next 24h: ${input.rainNext24hMm.toFixed(1)} mm`,
        input.vpdPeakKpa > 1.6 ? `VPD peak: ${input.vpdPeakKpa.toFixed(1)} kPa` : "",
      ].filter(Boolean),
      source: ["soil sensor", "weather"],
    });
  }

  if (input.et0Next24hMm > 4.5 || input.vpdPeakKpa > 1.6) {
    out.push({
      id: `${input.fieldId}-water-stress`,
      fieldId: input.fieldId,
      fieldName: input.fieldName,
      priority: "medium",
      title: `High water demand on ${input.fieldName}`,
      reason: `Forecast ET₀ is ${input.et0Next24hMm.toFixed(1)} mm and peak VPD is ${input.vpdPeakKpa.toFixed(1)} kPa, increasing crop water demand.`,
      action:
        "Prioritise moisture-sensitive crops on this field and avoid unnecessary midday field work.",
      when: "Today",
      where,
      confidence: Math.round(65 + Math.min(20, (input.vpdPeakKpa - 1.6) * 15)),
      signals: [
        `ET₀ (24h): ${input.et0Next24hMm.toFixed(1)} mm`,
        `VPD peak: ${input.vpdPeakKpa.toFixed(1)} kPa`,
        input.tempPeakC != null ? `Peak temp: ${input.tempPeakC.toFixed(0)}°C` : "",
      ].filter(Boolean),
      source: ["weather"],
    });
  }

  if (typeof input.ndviChangePct === "number" && input.ndviChangePct <= -10) {
    out.push({
      id: `${input.fieldId}-crop-stress`,
      fieldId: input.fieldId,
      fieldName: input.fieldName,
      priority: "high",
      title: `Inspect ${input.fieldName} for vegetation stress`,
      reason: `Satellite NDVI is down ${Math.abs(input.ndviChangePct).toFixed(0)}% versus the previous comparison period (demo signal).`,
      action:
        "Walk the field and check for pests, nutrient issues, heat stress or uneven irrigation before applying corrective measures.",
      when: "Within 48 hours",
      where,
      confidence: Math.round(70 + Math.min(15, Math.abs(input.ndviChangePct) - 10)),
      signals: [`NDVI change: ${input.ndviChangePct}%`],
      source: ["satellite"],
    });
  }

  if (
    input.sensorSoilMoisturePct >= 26 &&
    input.rainNext24hMm >= 2.5 &&
    !out.some((r) => r.id.includes("irrigation"))
  ) {
    out.push({
      id: `${input.fieldId}-delay-irrigation`,
      fieldId: input.fieldId,
      fieldName: input.fieldName,
      priority: "low",
      title: `Delay irrigation on ${input.fieldName}`,
      reason: `Soil moisture is ${input.sensorSoilMoisturePct}% and ${input.rainNext24hMm.toFixed(1)} mm of rain is forecast—irrigation may be unnecessary.`,
      action: "Skip scheduled irrigation unless visual checks show dry pockets.",
      when: "Next 24 hours",
      where,
      confidence: 78,
      signals: [
        `Soil moisture: ${input.sensorSoilMoisturePct}%`,
        `Rain next 24h: ${input.rainNext24hMm.toFixed(1)} mm`,
      ],
      source: ["soil sensor", "weather"],
    });
  }

  if (!out.length) {
    out.push({
      id: `${input.fieldId}-all-clear`,
      fieldId: input.fieldId,
      fieldName: input.fieldName,
      priority: "low",
      title: `No urgent action on ${input.fieldName}`,
      reason: "Demo thresholds for soil, weather and vegetation are within the normal range.",
      action: "Continue normal monitoring and review tomorrow's forecast.",
      when: "Tomorrow",
      where,
      confidence: 82,
      signals: ["All demo thresholds within range"],
      source: ["weather", "soil sensor"],
    });
  }

  return out;
}

export function buildFarmRecommendations(
  fields: Array<{
    id: string;
    name: string;
    detail: string;
    soilMoisturePct: number;
    ndviChangePct: number;
  }>,
  weatherForField: (
    fieldId: string
  ) => {
    rainMm: number;
    et0Mm: number;
    vpdPeakKpa: number;
    tempPeakC?: number;
  } | null,
  limit = 3
): Recommendation[] {
  const all = fields.flatMap((field) => {
    const wx = weatherForField(field.id);
    if (!wx) return [];
    return buildRecommendations({
      fieldId: field.id,
      fieldName: field.name,
      fieldDetail: field.detail,
      sensorSoilMoisturePct: field.soilMoisturePct,
      rainNext24hMm: wx.rainMm,
      et0Next24hMm: wx.et0Mm,
      vpdPeakKpa: wx.vpdPeakKpa,
      tempPeakC: wx.tempPeakC,
      ndviChangePct: field.ndviChangePct,
    });
  });

  const seen = new Set<string>();
  const unique = all.filter((rec) => {
    if (seen.has(rec.id)) return false;
    seen.add(rec.id);
    return true;
  });

  unique.sort((a, b) => {
    const p = priorityRank[a.priority] - priorityRank[b.priority];
    if (p !== 0) return p;
    return b.confidence - a.confidence;
  });

  const urgent = unique.filter((r) => !r.id.endsWith("-all-clear"));
  if (urgent.length >= limit) return urgent.slice(0, limit);
  return [...urgent, ...unique.filter((r) => r.id.endsWith("-all-clear"))].slice(0, limit);
}

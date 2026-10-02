export type Priority = "high" | "medium" | "low";

export type FarmInputs = {
  sensorSoilMoisturePct: number;
  rainNext24hMm: number;
  et0Next24hMm: number;
  vpdPeakKpa: number;
  ndviChangePct?: number;
};

export type Recommendation = {
  id: string;
  priority: Priority;
  title: string;
  reason: string;
  action: string;
  source: string[];
};

export function buildRecommendations(input: FarmInputs): Recommendation[] {
  const out: Recommendation[] = [];

  if (input.sensorSoilMoisturePct < 28 && input.rainNext24hMm < 2) {
    out.push({
      id: "irrigation",
      priority: "high",
      title: "Irrigation likely needed",
      reason: `Field sensor is at ${input.sensorSoilMoisturePct}% and only ${input.rainNext24hMm.toFixed(1)} mm of rain is expected in the next 24h.`,
      action: "Inspect the driest zone and schedule irrigation for the coolest part of the day.",
      source: ["soil sensor", "weather"],
    });
  }

  if (input.et0Next24hMm > 4.5 || input.vpdPeakKpa > 1.6) {
    out.push({
      id: "water-stress",
      priority: "medium",
      title: "High water-stress conditions",
      reason: `Forecast ET₀ is ${input.et0Next24hMm.toFixed(1)} mm and peak VPD is ${input.vpdPeakKpa.toFixed(1)} kPa.`,
      action: "Prioritise moisture-sensitive fields and avoid unnecessary midday field operations.",
      source: ["weather"],
    });
  }

  if (typeof input.ndviChangePct === "number" && input.ndviChangePct <= -10) {
    out.push({
      id: "crop-stress",
      priority: "high",
      title: "Vegetation stress detected",
      reason: `NDVI is down ${Math.abs(input.ndviChangePct).toFixed(0)}% versus the previous comparison period.`,
      action: "Inspect the highlighted zone for pest, nutrient, heat or irrigation stress before taking corrective action.",
      source: ["satellite"],
    });
  }

  if (!out.length) {
    out.push({
      id: "all-clear",
      priority: "low",
      title: "No urgent action detected",
      reason: "The demo thresholds are currently within the normal range.",
      action: "Continue normal monitoring and review tomorrow's forecast.",
      source: ["weather", "soil sensor"],
    });
  }

  return out;
}

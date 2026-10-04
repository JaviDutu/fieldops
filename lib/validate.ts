import { IRRIGATION_OPTIONS, SOIL_OPTIONS } from "@/lib/options";
import type { NewFieldInput } from "@/types/farm";

type Result = { ok: true; data: NewFieldInput } | { ok: false; error: string };

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function parseNewField(body: any): Result {
  const name = text(body?.name);
  const crop = text(body?.crop);
  const areaHa = num(body?.areaHa);
  const latitude = num(body?.latitude);
  const longitude = num(body?.longitude);
  const irrigation = text(body?.irrigation) || "rainfed";
  const soilType = text(body?.soilType) || null;
  const placeLabel = text(body?.placeLabel) || null;
  const notes = text(body?.notes) || null;
  const plantingDate = text(body?.plantingDate) || null;

  if (name.length < 1 || name.length > 80) return { ok: false, error: "Field name is required (80 characters max)." };
  if (crop.length < 1 || crop.length > 60) return { ok: false, error: "Crop is required." };
  if (areaHa === null || areaHa <= 0 || areaHa > 10000) return { ok: false, error: "Area must be between 0 and 10,000 hectares." };
  if (latitude === null || latitude < -90 || latitude > 90) return { ok: false, error: "Latitude is invalid." };
  if (longitude === null || longitude < -180 || longitude > 180) return { ok: false, error: "Longitude is invalid." };
  if (!(IRRIGATION_OPTIONS as readonly string[]).includes(irrigation)) return { ok: false, error: "Irrigation type is invalid." };
  if (soilType && !(SOIL_OPTIONS as readonly string[]).includes(soilType)) return { ok: false, error: "Soil type is invalid." };
  if (plantingDate && Number.isNaN(Date.parse(plantingDate))) return { ok: false, error: "Planting date is invalid." };
  if (notes && notes.length > 500) return { ok: false, error: "Notes are too long (500 characters max)." };

  return {
    ok: true,
    data: { name, crop, areaHa, latitude, longitude, placeLabel, irrigation, soilType, plantingDate, notes },
  };
}
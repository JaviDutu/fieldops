import type { Field } from "@prisma/client";
import type { FieldDTO } from "@/types/farm";

export function toDTO(f: Field): FieldDTO {
  return {
    id: f.id,
    name: f.name,
    crop: f.crop,
    areaHa: f.areaHa,
    latitude: f.latitude,
    longitude: f.longitude,
    placeLabel: f.placeLabel,
    polygon: JSON.parse(f.polygon),
    irrigation: f.irrigation,
    soilType: f.soilType,
    plantingDate: f.plantingDate ? f.plantingDate.toISOString() : null,
    notes: f.notes,
    createdAt: f.createdAt.toISOString(),
  };
}
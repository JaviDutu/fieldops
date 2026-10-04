export type LonLat = [number, number];

export type DataSource = {
  id: string;
  kind: "weather" | "soil" | "satellite";
  provider: string;
  status: "live" | "demo";
};

export type Field = {
  id: string;
  name: string;
  detail: string;
  lat: number;
  lon: number;
  polygon: LonLat[]; // GeoJSON order: longitude first, ring closed
  soilMoisturePct: number; // mock until /api/sensors exists
  ndviChangePct: number; // mock until /api/ndvi exists
  dataSources: DataSource[];
};

export type Farm = {
  id: string;
  name: string;
  region: string;
  crop: string;
  fields: Field[];
};

export type FieldDTO = {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  latitude: number;
  longitude: number;
  placeLabel: string | null;
  polygon: [number, number][];
  irrigation: string;
  soilType: string | null;
  plantingDate: string | null;
  notes: string | null;
  createdAt: string;
};

export type NewFieldInput = {
  name: string;
  crop: string;
  areaHa: number;
  latitude: number;
  longitude: number;
  placeLabel?: string | null;
  irrigation: string;
  soilType?: string | null;
  plantingDate?: string | null;
  notes?: string | null;
};
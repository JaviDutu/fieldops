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
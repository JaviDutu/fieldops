import { LonLat, DataSource, Farm, Field } from "@/types/farm";

// Builds a small square parcel around a point (about 11 ha) so every field has a polygon.
function parcel(lat: number, lon: number, d = 0.0015): LonLat[] {
  return [

    [lon - d, lat - d],
    [lon + d, lat - d],
    [lon + d, lat + d],
    [lon - d, lat + d],
    [lon - d, lat - d],
  ];
}

const sources: DataSource[] = [
  { id: "wx", kind: "weather", provider: "Open-Meteo", status: "live" },
  { id: "soil", kind: "soil", provider: "Soil sensor", status: "demo" },
  { id: "sat", kind: "satellite", provider: "Sentinel-2", status: "demo" },
];

export const demoFarm: Farm = {
  id: "efate-demo",
  name: "Efate Demo Farm",
  region: "Efate, Vanuatu",
  crop: "Mixed vegetables",
  fields: [
    {
      id: "f1", name: "Field 01", detail: "North block",
      lat: -17.7313, lon: 168.3273, polygon: parcel(-17.7313, 168.3273),
      soilMoisturePct: 34, ndviChangePct: 2, dataSources: sources,
    },
    {
      id: "f2", name: "Field 02", detail: "East block",
      lat: -17.7333, lon: 168.3303, polygon: parcel(-17.7333, 168.3303),
      soilMoisturePct: 18, ndviChangePct: -3, dataSources: sources,
    },
    {
      id: "f3", name: "Field 03", detail: "South block",

      lat: -17.7353, lon: 168.3273, polygon: parcel(-17.7353, 168.3273),
      soilMoisturePct: 23, ndviChangePct: -12, dataSources: sources,
    },
  ],
};

export async function getFarm(): Promise<Farm>{
    return demoFarm;
}

export function makeField(name: string, lat: number, lon: number): Field {
  const la = Number(lat.toFixed(4));
  const lo = Number(lon.toFixed(4));
  return {
    id: `custom-${Date.now()}`,
    name,
    detail: "Added by you",
    lat: la,
    lon: lo,
    polygon: parcel(la, lo),
    soilMoisturePct: 28,
    ndviChangePct: 0,
    dataSources: sources,
  };
}
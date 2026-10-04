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

/** Hackathon demo farm — see docs/DEMO_SCENARIO.md (Sarah, three fields). */
export const demoFarm: Farm = {
  id: "sarah-demo",
  name: "Sarah's Demo Farm",
  region: "Northern Victoria, Australia",
  crop: "Mixed (wheat, vegetables, pasture)",
  fields: [
    {
      id: "f1",
      name: "Field A",
      detail: "Wheat · north block",
      lat: -36.128,
      lon: 146.348,
      polygon: parcel(-36.128, 146.348),
      soilMoisturePct: 31,
      ndviChangePct: -4,
      dataSources: sources,
    },
    {
      id: "f2",
      name: "Field B",
      detail: "Vegetables · east block",
      lat: -36.131,
      lon: 146.352,
      polygon: parcel(-36.131, 146.352),
      soilMoisturePct: 17,
      ndviChangePct: -12,
      dataSources: sources,
    },
    {
      id: "f3",
      name: "Field C",
      detail: "Pasture · south block",
      lat: -36.133,
      lon: 146.348,
      polygon: parcel(-36.133, 146.348),
      soilMoisturePct: 28,
      ndviChangePct: 1,
      dataSources: sources,
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
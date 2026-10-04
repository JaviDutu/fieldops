import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { FieldDTO } from "@/types/farm";
import { squareParcel } from "@/lib/geo";

// Simple file-backed store: all fields live in one JSON file on disk.
// Delete data/fields.json (or run `npm run data:reset`) to go back to the demo fields.

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "fields.json");

export const FARM_NAME = "My Farm";

type StoreData = { farmName: string; fields: FieldDTO[] };

type DemoField = Omit<FieldDTO, "id" | "polygon" | "createdAt">;

const DEMO_FIELDS: DemoField[] = [
  {
    name: "North block",
    crop: "Wheat",
    areaHa: 4.2,
    latitude: -36.128,
    longitude: 146.348,
    placeLabel: "Northern Victoria, Australia",
    irrigation: "rainfed",
    soilType: "loam",
    plantingDate: "2026-04-12T00:00:00.000Z",
    notes: "Main wheat block. Watch soil moisture closely after dry spells.",
  },
  {
    name: "East block",
    crop: "Tomatoes",
    areaHa: 1.6,
    latitude: -36.131,
    longitude: 146.352,
    placeLabel: "Northern Victoria, Australia",
    irrigation: "drip",
    soilType: "clay",
    plantingDate: "2026-08-02T00:00:00.000Z",
    notes: "Drip-irrigated. Sensitive to water stress during flowering.",
  },
  {
    name: "South pasture",
    crop: "Mixed pasture",
    areaHa: 8.9,
    latitude: -36.133,
    longitude: 146.348,
    placeLabel: "Northern Victoria, Australia",
    irrigation: "rainfed",
    soilType: "sandy",
    plantingDate: null,
    notes: null,
  },
  {
    name: "Greenhouse 1",
    crop: "Capsicum",
    areaHa: 0.4,
    latitude: -36.129,
    longitude: 146.345,
    placeLabel: "Northern Victoria, Australia",
    irrigation: "sprinkler",
    soilType: "silt",
    plantingDate: "2026-06-20T00:00:00.000Z",
    notes: "Under cover — satellite NDVI is less reliable here, cross-check with sensor.",
  },
];

function buildField(input: DemoField, createdAt = new Date()): FieldDTO {
  return {
    ...input,
    id: randomUUID(),
    polygon: squareParcel(input.latitude, input.longitude, input.areaHa),
    createdAt: createdAt.toISOString(),
  };
}

function demoData(): StoreData {
  const now = Date.now();
  // Stagger createdAt so the demo fields keep a stable "newest first" order.
  const fields = DEMO_FIELDS.map((f, i) => buildField(f, new Date(now - i * 1000)));
  return { farmName: FARM_NAME, fields };
}

async function readData(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const seeded = demoData();
    await writeData(seeded);
    return seeded;
  }
}

// Write to a temp file then rename, so a crash mid-write never leaves a half-written file.
async function writeData(data: StoreData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

// Serialise every operation so concurrent requests can't overwrite each other's changes.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

function newestFirst(a: FieldDTO, b: FieldDTO) {
  return b.createdAt.localeCompare(a.createdAt);
}

export function listFields(): Promise<StoreData> {
  return withLock(async () => {
    const data = await readData();
    return { farmName: data.farmName, fields: [...data.fields].sort(newestFirst) };
  });
}

export function getField(id: string): Promise<FieldDTO | null> {
  return withLock(async () => {
    const data = await readData();
    return data.fields.find((f) => f.id === id) ?? null;
  });
}

export function createField(input: DemoField): Promise<FieldDTO> {
  return withLock(async () => {
    const data = await readData();
    const field = buildField(input);
    data.fields.push(field);
    await writeData(data);
    return field;
  });
}

export function deleteField(id: string): Promise<boolean> {
  return withLock(async () => {
    const data = await readData();
    const remaining = data.fields.filter((f) => f.id !== id);
    if (remaining.length === data.fields.length) return false;
    await writeData({ ...data, fields: remaining });
    return true;
  });
}

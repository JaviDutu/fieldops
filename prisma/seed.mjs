// Seeds one demo account with a farm and several fields so the dashboard has
// something real to look at. Safe to re-run: it replaces the demo farm's fields
// each time instead of accumulating duplicates.
//
// Run with: npm run db:seed
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

const DEMO_EMAIL = "demo@fieldops.app";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Demo Farmer";

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

// Mirrors lib/geo.ts's squareParcel (duplicated here since this script runs
// standalone, outside the Next.js module graph).
function squareParcel(lat, lon, areaHa) {
  const sideMetres = Math.sqrt(areaHa * 10000);
  const dLat = sideMetres / 2 / 111320;
  const dLon = sideMetres / 2 / (111320 * Math.cos((lat * Math.PI) / 180));
  return [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ];
}

const FIELDS = [
  {
    name: "North block",
    crop: "Wheat",
    areaHa: 4.2,
    latitude: -36.128,
    longitude: 146.348,
    placeLabel: "Northern Victoria, Australia",
    irrigation: "rainfed",
    soilType: "loam",
    plantingDate: new Date("2026-04-12"),
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
    plantingDate: new Date("2026-08-02"),
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
    plantingDate: new Date("2026-06-20"),
    notes: "Under cover — satellite NDVI is less reliable here, cross-check with sensor.",
  },
];

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { name: DEMO_NAME, email: DEMO_EMAIL, passwordHash },
  });

  let farm = await prisma.farm.findFirst({ where: { userId: user.id } });
  if (!farm) {
    farm = await prisma.farm.create({ data: { userId: user.id, name: `${DEMO_NAME}'s Farm` } });
  }

  await prisma.field.deleteMany({ where: { farmId: farm.id } });

  for (const f of FIELDS) {
    await prisma.field.create({
      data: {
        farmId: farm.id,
        name: f.name,
        crop: f.crop,
        areaHa: f.areaHa,
        latitude: f.latitude,
        longitude: f.longitude,
        placeLabel: f.placeLabel,
        polygon: JSON.stringify(squareParcel(f.latitude, f.longitude, f.areaHa)),
        irrigation: f.irrigation,
        soilType: f.soilType,
        plantingDate: f.plantingDate,
        notes: f.notes,
      },
    });
  }

  console.log("Seeded demo account:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log(`  farm:     ${farm.name} (${FIELDS.length} fields)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

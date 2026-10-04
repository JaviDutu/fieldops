// Builds a square parcel of the given area (in hectares) centred on a point.
export function squareParcel(lat: number, lon: number, areaHa: number): [number, number][] {
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
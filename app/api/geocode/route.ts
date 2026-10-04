import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// This API route provides a lightweight geocoding lookup for user-entered place names.
// It accepts a free-text query (`q`) and returns a small list of possible matches,
// including the name, administrative area, country, and coordinates, which can be used
// by the frontend for address autocomplete or map selection.
export async function GET(request: NextRequest) {
  // Read the raw search parameter, trim it, and reject empty or too-short queries.
  // This avoids unnecessary API calls and reduces invalid requests.
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  try {
    // Query the Open-Meteo geocoding API with a short, English-language search.
    // We limit the results to 5 candidates to keep the response concise and fast.
    const { data } = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: { name: q, count: 5, language: "en", format: "json" },
      timeout: 8000,
    });

    // Normalize the upstream response into a client-friendly payload.
    // `admin1` may be absent for some locations, so we convert missing values to null.
    const results = (data.results ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      admin: r.admin1 ?? null,
      country: r.country ?? null,
      lat: r.latitude,
      lon: r.longitude,
    }));

    // Return successful results as JSON so the frontend can render a dropdown or map pin.
    return NextResponse.json({ results });
  } catch {
    // If the upstream geocoding service fails or times out, the route returns a 502
    // to signal a bad gateway while avoiding exposing raw service errors to the client.
    return NextResponse.json({ error: "Geocoding unavailable" }, { status: 502 });
  }
}
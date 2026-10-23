import { Place, PinVisibilityType } from "../../types";

export interface CoordinateValidationResult {
  valid: boolean;
  error?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

/**
 * Validates decimal latitude (-90 to 90) and longitude (-180 to 180)
 */
export function validateCoordinates(
  rawLat: string | number,
  rawLng: string | number,
): CoordinateValidationResult {
  const lat = typeof rawLat === "number" ? rawLat : parseFloat(String(rawLat).trim());
  const lng = typeof rawLng === "number" ? rawLng : parseFloat(String(rawLng).trim());

  if (isNaN(lat)) {
    return { valid: false, error: "Latitude must be a valid decimal number." };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: "Latitude must be between -90.0 and 90.0." };
  }
  if (isNaN(lng)) {
    return { valid: false, error: "Longitude must be a valid decimal number." };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: "Longitude must be between -180.0 and 180.0." };
  }

  return {
    valid: true,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
  };
}

/**
 * Generates canonical Google Maps URL from verified numeric coordinates
 */
export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export interface MapsLocationParsed {
  valid: boolean;
  mapsUrl: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
  error?: string | undefined;
}

/**
 * Smart Google Maps link / coordinates parser.
 * Handles:
 * 1. Mobile short links (e.g. https://maps.app.goo.gl/TfKpsZPCyisNzSXv6)
 * 2. Desktop URLs (e.g. https://www.google.com/maps/place/... or https://maps.google.com/?q=...)
 * 3. Short URLs (e.g. https://goo.gl/maps/...)
 * 4. Coordinate pairs (e.g. "18.9134, 72.8245" or "18.9134,72.8245")
 * 5. Extraction of coordinates if embedded in URL (@lat,lng or q=lat,lng)
 */
export function parseMapsLocationInput(input: string): MapsLocationParsed {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: true, mapsUrl: "" };
  }

  // 1. Check if input is a coordinate pair: "19.1316, 72.8109"
  const coordPairRegex = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;
  const coordMatch = trimmed.match(coordPairRegex);
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    const valRes = validateCoordinates(lat, lng);
    if (!valRes.valid) {
      return { valid: false, mapsUrl: "", error: valRes.error };
    }
    return {
      valid: true,
      mapsUrl: buildGoogleMapsUrl(valRes.latitude!, valRes.longitude!),
      latitude: valRes.latitude,
      longitude: valRes.longitude,
    };
  }

  // 2. Check if input is a URL
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("maps.app.goo.gl/") ||
    trimmed.startsWith("goo.gl/maps/")
  ) {
    let urlStr = trimmed;
    if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
      urlStr = "https://" + urlStr;
    }

    try {
      new URL(urlStr);

      // Attempt to extract lat/lng if present in the URL string
      const urlLatLongRegex = /(?:@|\?q=|&q=|ll=|destination=)(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/;
      const match = urlStr.match(urlLatLongRegex);

      let lat: number | undefined;
      let lng: number | undefined;
      if (match && match[1] && match[2]) {
        const parsedLat = parseFloat(match[1]);
        const parsedLng = parseFloat(match[2]);
        const valRes = validateCoordinates(parsedLat, parsedLng);
        if (valRes.valid) {
          lat = valRes.latitude;
          lng = valRes.longitude;
        }
      }

      return {
        valid: true,
        mapsUrl: urlStr,
        latitude: lat,
        longitude: lng,
      };
    } catch {
      return {
        valid: false,
        mapsUrl: "",
        error: "Please enter a valid Google Maps URL or coordinates.",
      };
    }
  }

  // 3. Fallback: If it's a general address text (not empty)
  return {
    valid: true,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`,
  };
}

/**
 * Filters place visibility so private / confirmed-guests-only pins
 * are never disclosed in public responses unless the viewer is staff
 * or holds a confirmed booking for that place.
 */
export function filterPlaceDetails(
  place: Place,
  isConfirmedGuestOrStaff: boolean,
): Place {
  if (place.pin_visibility === "public" || isConfirmedGuestOrStaff) {
    return place;
  }
  return {
    ...place,
    arrival_instructions: undefined,
    // Obfuscate exact coordinates for unauthenticated / unconfirmed viewers
    latitude: 0,
    longitude: 0,
  };
}

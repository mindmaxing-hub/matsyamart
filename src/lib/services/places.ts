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

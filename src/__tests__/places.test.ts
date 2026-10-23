import { describe, it, expect } from "vitest";
import {
  parseMapsLocationInput,
  validateCoordinates,
  buildGoogleMapsUrl,
  filterPlaceDetails,
} from "../lib/services/places";
import { Place } from "../types";

describe("Places & Google Maps Location Service", () => {
  it("handles empty or whitespace-only inputs cleanly", () => {
    const res = parseMapsLocationInput("");
    expect(res.valid).toBe(true);
    expect(res.mapsUrl).toBe("");

    const res2 = parseMapsLocationInput("   ");
    expect(res2.valid).toBe(true);
    expect(res2.mapsUrl).toBe("");
  });

  it("directly accepts Google Maps mobile share links (e.g. maps.app.goo.gl)", () => {
    const sampleLink = "https://maps.app.goo.gl/TfKpsZPCyisNzSXv6";
    const res = parseMapsLocationInput(sampleLink);

    expect(res.valid).toBe(true);
    expect(res.mapsUrl).toBe(sampleLink);
  });

  it("extracts coordinates when embedded in Google Maps URLs (?q=lat,lng)", () => {
    const urlWithCoords = "https://maps.google.com/?q=18.9134,72.8245";
    const res = parseMapsLocationInput(urlWithCoords);

    expect(res.valid).toBe(true);
    expect(res.mapsUrl).toBe(urlWithCoords);
    expect(res.latitude).toBe(18.9134);
    expect(res.longitude).toBe(72.8245);
  });

  it("extracts coordinates from @lat,lng desktop Google Maps URLs", () => {
    const urlAtCoords = "https://www.google.com/maps/@19.131600,72.810900,16z";
    const res = parseMapsLocationInput(urlAtCoords);

    expect(res.valid).toBe(true);
    expect(res.latitude).toBe(19.1316);
    expect(res.longitude).toBe(72.8109);
  });

  it("parses comma-separated coordinate pairs and builds canonical Google Maps URL", () => {
    const coordsStr = "18.913400, 72.824500";
    const res = parseMapsLocationInput(coordsStr);

    expect(res.valid).toBe(true);
    expect(res.latitude).toBe(18.9134);
    expect(res.longitude).toBe(72.8245);
    expect(res.mapsUrl).toContain("https://www.google.com/maps/search/?api=1&query=18.9134,72.8245");
  });

  it("rejects out-of-range latitude or longitude values", () => {
    const invalidLat = "199.1316, 72.8109";
    const res = parseMapsLocationInput(invalidLat);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Latitude must be between");

    const invalidLng = "19.1316, 250.8109";
    const res2 = parseMapsLocationInput(invalidLng);
    expect(res2.valid).toBe(false);
    expect(res2.error).toContain("Longitude must be between");
  });

  it("converts free-text address strings into Google Maps search URL", () => {
    const address = "Tandel House, Sassoon Docks, Colaba, Mumbai";
    const res = parseMapsLocationInput(address);

    expect(res.valid).toBe(true);
    expect(res.mapsUrl).toContain("https://www.google.com/maps/search/?api=1&query=");
    expect(res.mapsUrl).toContain("Tandel%20House");
  });

  it("filters private pin visibility for public viewers while retaining for confirmed guests", () => {
    const secretPlace: Place = {
      id: "place-secret-01",
      name: "Secret Cove",
      address: "Hidden Rocks, Versova",
      latitude: 19.1316,
      longitude: 72.8109,
      arrival_instructions: "Password: Red Crab",
      pin_visibility: "confirmed_guests_only",
      photos: [],
    };

    // Public unconfirmed view: coordinates obfuscated to 0
    const publicView = filterPlaceDetails(secretPlace, false);
    expect(publicView.latitude).toBe(0);
    expect(publicView.longitude).toBe(0);
    expect(publicView.arrival_instructions).toBeUndefined();

    // Confirmed guest or staff view: coordinates and instructions retained
    const guestView = filterPlaceDetails(secretPlace, true);
    expect(guestView.latitude).toBe(19.1316);
    expect(guestView.longitude).toBe(72.8109);
    expect(guestView.arrival_instructions).toBe("Password: Red Crab");
  });
});

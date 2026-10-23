import React, { useState, useEffect } from "react";
import { MapPin, ExternalLink, Eye, EyeOff, AlertCircle } from "lucide-react";
import { validateCoordinates, buildGoogleMapsUrl } from "../../lib/services/places";
import { PinVisibilityType } from "../../types";

interface SharedCoordinateInputProps {
  latitude: number | string;
  longitude: number | string;
  pinVisibility?: PinVisibilityType;
  onChange: (coords: {
    latitude: number;
    longitude: number;
    mapsUrl: string;
    pinVisibility: PinVisibilityType;
    isValid: boolean;
  }) => void;
  label?: string;
  required?: boolean;
}

export const SharedCoordinateInput: React.FC<SharedCoordinateInputProps> = ({
  latitude,
  longitude,
  pinVisibility = "public",
  onChange,
  label = "GPS Coordinates (Latitude, Longitude)",
  required = false,
}) => {
  const [latInput, setLatInput] = useState(String(latitude || ""));
  const [lngInput, setLngInput] = useState(String(longitude || ""));
  const [visibility, setVisibility] = useState<PinVisibilityType>(pinVisibility);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLatInput(String(latitude || ""));
  }, [latitude]);

  useEffect(() => {
    setLngInput(String(longitude || ""));
  }, [longitude]);

  useEffect(() => {
    setVisibility(pinVisibility);
  }, [pinVisibility]);

  const handleValidation = (lat: string, lng: string, vis: PinVisibilityType) => {
    if (!lat.trim() && !lng.trim()) {
      if (required) {
        setError("Coordinates are required.");
        onChange({ latitude: 0, longitude: 0, mapsUrl: "", pinVisibility: vis, isValid: false });
      } else {
        setError(null);
        onChange({ latitude: 0, longitude: 0, mapsUrl: "", pinVisibility: vis, isValid: true });
      }
      return;
    }

    const res = validateCoordinates(lat, lng);
    if (!res.valid) {
      setError(res.error || "Invalid coordinate values.");
      onChange({ latitude: 0, longitude: 0, mapsUrl: "", pinVisibility: vis, isValid: false });
    } else {
      setError(null);
      const url = buildGoogleMapsUrl(res.latitude!, res.longitude!);
      onChange({
        latitude: res.latitude!,
        longitude: res.longitude!,
        mapsUrl: url,
        pinVisibility: vis,
        isValid: true,
      });
    }
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLatInput(val);
    handleValidation(val, lngInput, visibility);
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLngInput(val);
    handleValidation(latInput, val, visibility);
  };

  const handleVisibilityToggle = (vis: PinVisibilityType) => {
    setVisibility(vis);
    handleValidation(latInput, lngInput, vis);
  };

  const isValidNumber =
    latInput.trim() &&
    lngInput.trim() &&
    !isNaN(Number(latInput)) &&
    !isNaN(Number(lngInput)) &&
    !error;

  const currentMapsUrl = isValidNumber
    ? buildGoogleMapsUrl(Number(latInput), Number(lngInput))
    : "";

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-[#29100b]/60 border border-[#dab38c]/20">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#e3a157] flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>{label}</span>
          {required && <span className="text-rose-400">*</span>}
        </label>
        {currentMapsUrl && (
          <a
            href={currentMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 hover:underline"
          >
            <span>Preview in Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] text-[#dab38c]/70 uppercase font-mono block mb-1">
            Latitude (-90 to 90)
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 19.131600"
            value={latInput}
            onChange={handleLatChange}
            className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] font-mono focus:border-[#e3a157] focus:outline-hidden"
          />
        </div>
        <div>
          <span className="text-[10px] text-[#dab38c]/70 uppercase font-mono block mb-1">
            Longitude (-180 to 180)
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 72.810900"
            value={lngInput}
            onChange={handleLngChange}
            className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] font-mono focus:border-[#e3a157] focus:outline-hidden"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pin Visibility Selector */}
      <div className="pt-2 border-t border-[#dab38c]/15 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-[#dab38c]/80 flex items-center gap-1">
          Pin Visibility:
        </span>
        <div className="flex items-center gap-1.5 bg-[#1f0b07] p-1 rounded-xl border border-[#dab38c]/20 text-[11px]">
          <button
            type="button"
            onClick={() => handleVisibilityToggle("public")}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              visibility === "public"
                ? "bg-[#e3a157] text-[#29100b] font-bold shadow-xs"
                : "text-[#dab38c] hover:text-[#f5edeb]"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Public Pin</span>
          </button>
          <button
            type="button"
            onClick={() => handleVisibilityToggle("confirmed_guests_only")}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              visibility === "confirmed_guests_only"
                ? "bg-[#e3a157] text-[#29100b] font-bold shadow-xs"
                : "text-[#dab38c] hover:text-[#f5edeb]"
            }`}
            title="Exact coordinates revealed only on confirmed ticket pass"
          >
            <EyeOff className="w-3 h-3" />
            <span>Confirmed Guests Only</span>
          </button>
        </div>
      </div>
    </div>
  );
};

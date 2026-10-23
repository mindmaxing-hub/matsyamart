import React, { useState, useEffect } from "react";
import {
  MapPin,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  validateCoordinates,
  buildGoogleMapsUrl,
  parseMapsLocationInput,
} from "../../lib/services/places";
import { PinVisibilityType } from "../../types";

interface SharedCoordinateInputProps {
  latitude: number | string;
  longitude: number | string;
  mapsUrl?: string;
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
  mapsUrl = "",
  pinVisibility = "public",
  onChange,
  label = "Google Maps Location / Pin Link",
  required = false,
}) => {
  // Compute initial maps link
  const initialUrl =
    mapsUrl ||
    (latitude && longitude
      ? buildGoogleMapsUrl(Number(latitude), Number(longitude))
      : "");

  const [urlInput, setUrlInput] = useState(initialUrl);
  const [latInput, setLatInput] = useState(String(latitude || ""));
  const [lngInput, setLngInput] = useState(String(longitude || ""));
  const [visibility, setVisibility] = useState<PinVisibilityType>(pinVisibility);
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mapsUrl) {
      setUrlInput(mapsUrl);
    } else if (latitude && longitude && !urlInput) {
      setUrlInput(buildGoogleMapsUrl(Number(latitude), Number(longitude)));
    }
  }, [mapsUrl, latitude, longitude]);

  useEffect(() => {
    setLatInput(String(latitude || ""));
  }, [latitude]);

  useEffect(() => {
    setLngInput(String(longitude || ""));
  }, [longitude]);

  useEffect(() => {
    setVisibility(pinVisibility);
  }, [pinVisibility]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);

    if (!val.trim()) {
      if (required) {
        setError("Google Maps link or location is required.");
        onChange({
          latitude: 0,
          longitude: 0,
          mapsUrl: "",
          pinVisibility: visibility,
          isValid: false,
        });
      } else {
        setError(null);
        onChange({
          latitude: 0,
          longitude: 0,
          mapsUrl: "",
          pinVisibility: visibility,
          isValid: true,
        });
      }
      return;
    }

    const parsed = parseMapsLocationInput(val);
    if (!parsed.valid) {
      setError(parsed.error || "Please enter a valid Google Maps URL or coordinates.");
      onChange({
        latitude: 0,
        longitude: 0,
        mapsUrl: "",
        pinVisibility: visibility,
        isValid: false,
      });
    } else {
      setError(null);
      const derivedLat = parsed.latitude ?? (latInput ? Number(latInput) : 0);
      const derivedLng = parsed.longitude ?? (lngInput ? Number(lngInput) : 0);
      if (parsed.latitude !== undefined) setLatInput(String(parsed.latitude));
      if (parsed.longitude !== undefined) setLngInput(String(parsed.longitude));

      onChange({
        latitude: derivedLat,
        longitude: derivedLng,
        mapsUrl: parsed.mapsUrl,
        pinVisibility: visibility,
        isValid: true,
      });
    }
  };

  const handleManualCoordsChange = (newLat: string, newLng: string) => {
    setLatInput(newLat);
    setLngInput(newLng);

    if (!newLat.trim() && !newLng.trim()) {
      return;
    }

    const res = validateCoordinates(newLat, newLng);
    if (!res.valid) {
      setError(res.error || "Invalid coordinate values.");
    } else {
      setError(null);
      const generatedUrl = buildGoogleMapsUrl(res.latitude!, res.longitude!);
      setUrlInput(generatedUrl);
      onChange({
        latitude: res.latitude!,
        longitude: res.longitude!,
        mapsUrl: generatedUrl,
        pinVisibility: visibility,
        isValid: true,
      });
    }
  };

  const handleVisibilityToggle = (vis: PinVisibilityType) => {
    setVisibility(vis);
    onChange({
      latitude: latInput ? Number(latInput) : 0,
      longitude: lngInput ? Number(lngInput) : 0,
      mapsUrl: urlInput,
      pinVisibility: vis,
      isValid: !error,
    });
  };

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-[#29100b]/60 border border-[#dab38c]/20">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#e3a157] flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>{label}</span>
          {required && <span className="text-rose-400">*</span>}
        </label>

        {urlInput && !error && (
          <a
            href={urlInput}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-400/40 text-sky-300 hover:text-sky-200 font-bold flex items-center gap-1.5 hover:bg-sky-900 transition-all shadow-xs"
            title="Click to view exact location in Google Maps"
          >
            <span>🗺️ View on Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Main Single Input: Google Maps URL */}
      <div className="relative">
        <input
          type="text"
          placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/...) or coordinates"
          value={urlInput}
          onChange={handleUrlChange}
          className="w-full px-3.5 py-2.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] placeholder:text-[#dab38c]/40 font-normal focus:border-[#e3a157] focus:outline-hidden"
        />
        {urlInput && !error && (
          <div className="absolute right-3 top-2.5 pointer-events-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#dab38c]/70 leading-normal">
        Tip: Open Google Maps, tap <strong>Share</strong>, and paste the link here. No manual latitude/longitude hunting required.
      </p>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Optional Advanced Coordinates Expander */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
          className="text-[10px] text-[#dab38c]/60 hover:text-[#e3a157] font-mono flex items-center gap-1 transition-colors cursor-pointer"
        >
          {showAdvancedCoords ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          <span>
            {showAdvancedCoords
              ? "Hide Raw Lat/Lng Coordinates"
              : "Advanced: View/Edit Raw Coordinates (Optional)"}
          </span>
          {latInput && lngInput && !showAdvancedCoords && (
            <span className="text-[#dab38c]/40 ml-1">
              ({Number(latInput).toFixed(4)}, {Number(lngInput).toFixed(4)})
            </span>
          )}
        </button>

        {showAdvancedCoords && (
          <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-[#dab38c]/10">
            <div>
              <span className="text-[10px] text-[#dab38c]/70 uppercase font-mono block mb-1">
                Latitude
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 19.131600"
                value={latInput}
                onChange={(e) => handleManualCoordsChange(e.target.value, lngInput)}
                className="w-full px-3 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] font-mono focus:border-[#e3a157] focus:outline-hidden"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#dab38c]/70 uppercase font-mono block mb-1">
                Longitude
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 72.810900"
                value={lngInput}
                onChange={(e) => handleManualCoordsChange(latInput, e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] font-mono focus:border-[#e3a157] focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Pin Visibility Selector */}
      <div className="pt-2 border-t border-[#dab38c]/15 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-[#dab38c]/80 flex items-center gap-1">
          Pin Visibility:
        </span>
        <div className="flex items-center gap-1.5 bg-[#1f0b07] p-1 rounded-xl border border-[#dab38c]/20 text-[11px]">
          <button
            type="button"
            onClick={() => handleVisibilityToggle("public")}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
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

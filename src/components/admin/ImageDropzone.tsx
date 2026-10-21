import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  label = "Cover Photo",
  helperText = "PNG, JPG, WEBP up to 10MB (auto-optimized)",
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress and convert image to high-fidelity, compact base64 data URL
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please drop or select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setIsProcessing(true);

    // If SVG, handle as text/dataURL directly
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setIsProcessing(false);
        toast.success("SVG image uploaded successfully!");
      };
      reader.onerror = () => {
        setIsProcessing(false);
        toast.error("Failed to read image file.");
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1400; // Crisp retina resolution
          let { width, height } = img;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            onChange(e.target?.result as string);
            setIsProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Export as optimized JPEG at 0.85 quality (~150-250KB)
          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          onChange(optimizedDataUrl);
          setIsProcessing(false);
          toast.success("Image uploaded & optimized successfully!");
        } catch (err) {
          console.error("Canvas optimization error:", err);
          onChange(e.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        toast.error("Could not decode image.");
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      toast.error("Failed to read file.");
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0]) {
      processImageFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      processImageFile(files[0]);
    }
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5 text-xs">
      {/* Label Strip */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-[#dab38c] uppercase">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-[#dab38c]/70 hover:text-[#e3a157] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? "Hide URL input" : "Paste image URL instead"}</span>
        </button>
      </div>

      {/* Direct URL input fallback */}
      {showUrlInput && (
        <div className="p-2.5 bg-[#29100b] border border-[#dab38c]/25 rounded-xl space-y-1 mb-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3 py-1.5 bg-[#35160e] border border-[#dab38c]/30 rounded-lg text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono text-[11px]"
          />
          <div className="text-[10px] text-[#dab38c]/60">
            Paste any direct CDN or Unsplash image link here.
          </div>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          isDragging
            ? "border-[#e3a157] bg-[#e3a157]/15 shadow-[0_0_25px_rgba(227,161,87,0.3)] scale-[1.01]"
            : value
              ? "border-[#dab38c]/30 bg-[#29100b] hover:border-[#dab38c]/50"
              : "border-[#dab38c]/25 bg-[#35160e]/80 hover:bg-[#35160e] hover:border-[#e3a157]/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {value ? (
          /* Live Image Preview State */
          <div className="relative h-44 sm:h-52 w-full bg-[#1f0b07] flex items-center justify-center overflow-hidden">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            {/* Dark gradient overlay for action buttons */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Image Loaded</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="p-1.5 bg-black/70 hover:bg-rose-950 text-white hover:text-rose-300 rounded-xl border border-white/20 transition-all cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center">
                <span className="px-3 py-1.5 bg-[#e3a157] text-[#29100b] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-transform group-hover:scale-105">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Drop new file or click to replace</span>
                </span>
              </div>

              <div className="text-[10px] text-center text-[#dab38c]/80 truncate">
                Click anywhere or drop replacement image
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div className="py-7 px-4 flex flex-col items-center justify-center text-center space-y-2.5">
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDragging
                  ? "bg-[#e3a157] text-[#29100b] border-[#e3a157] scale-110"
                  : "bg-[#29100b] text-[#e3a157] border-[#dab38c]/20 group-hover:border-[#e3a157]/50 group-hover:scale-105"
              }`}
            >
              {isProcessing ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#e3a157]" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-[#f5edeb]">
                {isDragging ? (
                  <span className="text-[#e3a157]">Drop your image file here!</span>
                ) : (
                  <span>
                    Drag &amp; drop image here, or{" "}
                    <span className="text-[#e3a157] underline decoration-[#e3a157]/50">
                      browse from device
                    </span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#dab38c]/70">{helperText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

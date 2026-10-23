/**
 * Responsive & Adaptive Image Optimization Utility for MatsyaMart
 *
 * Rewrites remote CDN URLs (such as Unsplash and Supabase Storage) to serve
 * correctly sized, modern WebP/AVIF formats with high compression efficiency,
 * directly eliminating Lighthouse / PageSpeed payload bloat.
 */

export interface ImageOptimizationOptions {
  /** Target display width in CSS/physical pixels */
  width?: number;
  /** Target display height in CSS/physical pixels */
  height?: number;
  /** Compression quality (1-100, recommended 70-80) */
  quality?: number;
  /** Desired format or auto-negotiation (default 'auto') */
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  /** Cropping mode (default 'crop') */
  fit?: "crop" | "cover" | "contain" | "fill";
}

/**
 * Returns an optimized image URL for modern browsers.
 * If the image is hosted on an asset CDN supporting dynamic resizing (e.g. Unsplash),
 * query parameters are transformed for modern compression and dimensions.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: ImageOptimizationOptions = {},
): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // 1. Unsplash CDN Optimization
  if (trimmed.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(trimmed);
      const width = options.width || 800;
      const quality = options.quality ?? 75;
      const fit = options.fit ?? "crop";

      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", String(quality));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", fit);

      if (options.height) {
        parsed.searchParams.set("h", String(options.height));
      }

      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  // 2. Supabase Storage Public Image Transformation
  // Transforms /storage/v1/object/public/ to /storage/v1/render/image/public/ if dimensions specified
  if (
    trimmed.includes("/storage/v1/object/public/") &&
    (options.width || options.height || options.quality)
  ) {
    try {
      const parsed = new URL(trimmed);
      parsed.pathname = parsed.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
      if (options.width) parsed.searchParams.set("width", String(options.width));
      if (options.height) parsed.searchParams.set("height", String(options.height));
      if (options.quality) parsed.searchParams.set("quality", String(options.quality));
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Generates an HTML standard `srcset` attribute string for responsive <img> or <picture>.
 *
 * Example output:
 * "https://...w=320 320w, https://...w=640 640w, https://...w=960 960w"
 */
export function getResponsiveImageSrcSet(
  url?: string | null,
  widths: number[] = [320, 640, 960],
  quality: number = 75,
): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return "";
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(trimmed, { width: w, quality })} ${w}w`)
    .join(", ");
}

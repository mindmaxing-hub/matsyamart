import { describe, it, expect } from "vitest";
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../lib/images";

describe("Image Optimizer Utility (Core Web Vitals LCP & Payload Reduction)", () => {
  const sampleUnsplash =
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80";

  it("handles empty or null URLs gracefully without throwing", () => {
    expect(getOptimizedImageUrl(undefined)).toBe("");
    expect(getOptimizedImageUrl(null)).toBe("");
    expect(getOptimizedImageUrl("")).toBe("");
    expect(getResponsiveImageSrcSet(undefined)).toBe("");
  });

  it("rewrites Unsplash URL with custom width, quality, and auto=format", () => {
    const optimized = getOptimizedImageUrl(sampleUnsplash, {
      width: 380,
      quality: 75,
    });

    const parsed = new URL(optimized);
    expect(parsed.searchParams.get("w")).toBe("380");
    expect(parsed.searchParams.get("q")).toBe("75");
    expect(parsed.searchParams.get("auto")).toBe("format");
    expect(parsed.searchParams.get("fit")).toBe("crop");
  });

  it("supports setting height and crop fit for aspect-ratio preservation", () => {
    const optimized = getOptimizedImageUrl(sampleUnsplash, {
      width: 400,
      height: 300,
      fit: "cover",
    });

    const parsed = new URL(optimized);
    expect(parsed.searchParams.get("w")).toBe("400");
    expect(parsed.searchParams.get("h")).toBe("300");
    expect(parsed.searchParams.get("fit")).toBe("cover");
  });

  it("leaves data: and blob: URLs untouched", () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB";
    expect(getOptimizedImageUrl(dataUrl, { width: 300 })).toBe(dataUrl);

    const blobUrl = "blob:https://matsyamart.in/984b3e81-7928-4448";
    expect(getOptimizedImageUrl(blobUrl, { width: 300 })).toBe(blobUrl);
  });

  it("transforms Supabase storage URLs to /render/image/public/ endpoint", () => {
    const supabaseUrl =
      "https://example.supabase.co/storage/v1/object/public/listings/walk.jpg";
    const transformed = getOptimizedImageUrl(supabaseUrl, {
      width: 600,
      quality: 80,
    });

    expect(transformed).toContain("/storage/v1/render/image/public/listings/walk.jpg");
    expect(transformed).toContain("width=600");
    expect(transformed).toContain("quality=80");
  });

  it("generates valid standard srcset strings for responsive picture tags", () => {
    const srcSet = getResponsiveImageSrcSet(sampleUnsplash, [320, 640]);
    expect(srcSet).toContain("w=320");
    expect(srcSet).toContain("320w");
    expect(srcSet).toContain("w=640");
    expect(srcSet).toContain("640w");
  });
});

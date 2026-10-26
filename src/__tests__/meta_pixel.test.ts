import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  META_PIXEL_ID,
  trackMetaPixel,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
} from "../lib/metaPixel";

describe("Meta Pixel Tracking Engine Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as any).fbq;
  });

  it("exports official Meta Pixel ID 1795293538302324", () => {
    expect(META_PIXEL_ID).toBe("1795293538302324");
  });

  it("handles trackMetaPixel safely when window.fbq is undefined without throwing", () => {
    const result = trackMetaPixel("PageView");
    expect(result).toBe(false);
  });

  it("calls window.fbq when present with correct arguments", () => {
    const fbqMock = vi.fn();
    (window as any).fbq = fbqMock;

    const success = trackMetaPixel("PageView");
    expect(success).toBe(true);
    expect(fbqMock).toHaveBeenCalledWith("track", "PageView");
  });

  it("dispatches ViewContent with e-commerce parameters", () => {
    const fbqMock = vi.fn();
    (window as any).fbq = fbqMock;

    trackViewContent({
      content_id: "walk-1",
      content_name: "Sassoon Docks Dawn Walk",
      content_type: "walk",
      value: 850,
      currency: "INR",
    });

    expect(fbqMock).toHaveBeenCalledWith("track", "ViewContent", {
      content_ids: ["walk-1"],
      content_name: "Sassoon Docks Dawn Walk",
      content_type: "walk",
      value: 850,
      currency: "INR",
    });
  });

  it("dispatches AddToCart with quantity and item value", () => {
    const fbqMock = vi.fn();
    (window as any).fbq = fbqMock;

    trackAddToCart({
      content_id: "good-bombay-duck",
      content_name: "Artisanal Sun-Dried Bombay Duck",
      value: 500,
      quantity: 2,
    });

    expect(fbqMock).toHaveBeenCalledWith("track", "AddToCart", {
      content_ids: ["good-bombay-duck"],
      content_name: "Artisanal Sun-Dried Bombay Duck",
      content_type: "product",
      value: 500,
      currency: "INR",
      quantity: 2,
    });
  });

  it("dispatches InitiateCheckout with basket count and total value", () => {
    const fbqMock = vi.fn();
    (window as any).fbq = fbqMock;

    trackInitiateCheckout({
      num_items: 3,
      value: 2550,
      currency: "INR",
      content_ids: ["walk-1", "feast-1"],
    });

    expect(fbqMock).toHaveBeenCalledWith("track", "InitiateCheckout", {
      num_items: 3,
      value: 2550,
      currency: "INR",
      content_ids: ["walk-1", "feast-1"],
    });
  });

  it("dispatches Purchase event with order reference and confirmed revenue", () => {
    const fbqMock = vi.fn();
    (window as any).fbq = fbqMock;

    trackPurchase({
      order_id: "MM-WK-2026-1029",
      value: 1700,
      num_items: 2,
      content_ids: ["walk-1"],
    });

    expect(fbqMock).toHaveBeenCalledWith("track", "Purchase", {
      order_id: "MM-WK-2026-1029",
      value: 1700,
      currency: "INR",
      num_items: 2,
      content_ids: ["walk-1"],
    });
  });
});

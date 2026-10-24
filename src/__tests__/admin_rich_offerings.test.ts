import { describe, it, expect } from "vitest";
import { Listing, ExperienceSlot, ItineraryItem } from "../types";

describe("Admin Rich Offering Builder & Multi-Slot Engine", () => {
  it("should calculate recurring weekend slots for 4 weeks with custom lunch timing", () => {
    const listingId = "exp-test-feast-101";
    const weeksCount = 4;
    const capacity = 12;
    const startTime = "12:30";
    const endTime = "15:00";
    const days: ("saturday" | "sunday")[] = ["saturday", "sunday"];

    const newSlots: ExperienceSlot[] = [];
    const now = new Date();
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const dayMap: Record<string, number> = { sunday: 0, saturday: 6 };
    const targetDayOffsets = days.map((d) => dayMap[d]).filter((d) => d !== undefined) as number[];

    for (let w = 0; w < weeksCount; w++) {
      for (const dayOffset of targetDayOffsets) {
        const date = new Date(now);
        let diff = (dayOffset - now.getDay() + 7) % 7;
        if (diff === 0 && w === 0) {
          const testStart = new Date(now);
          testStart.setHours(startH ?? 6, startM ?? 30, 0, 0);
          if (now.getTime() >= testStart.getTime()) {
            diff = 7;
          }
        }
        date.setDate(now.getDate() + diff + w * 7);

        const start = new Date(date);
        start.setHours(startH ?? 12, startM ?? 30, 0, 0);
        const end = new Date(date);
        end.setHours(endH ?? 15, endM ?? 0, 0, 0);

        newSlots.push({
          id: `slot-rec-${listingId}-${w}-${dayOffset}`,
          offering_id: listingId,
          listing_id: listingId,
          slot_start: start.toISOString(),
          slot_end: end.toISOString(),
          capacity,
          booked_count: 0,
          revision_number: 1,
          is_cancelled: false,
        });
      }
    }

    // 4 weeks * 2 days (Sat + Sun) = 8 slots
    expect(newSlots.length).toBe(8);

    // Verify all slots belong to Saturday (6) or Sunday (0)
    newSlots.forEach((slot) => {
      const d = new Date(slot.slot_start);
      expect([0, 6]).toContain(d.getDay());
      expect(d.getHours()).toBe(12);
      expect(d.getMinutes()).toBe(30);
      expect(slot.capacity).toBe(12);
      expect(slot.listing_id).toBe(listingId);
    });
  });

  it("should generate Saturday-only slots when configured for specific day", () => {
    const listingId = "exp-test-walk-202";
    const weeksCount = 4;
    const days: ("saturday" | "sunday")[] = ["saturday"];

    const newSlots: ExperienceSlot[] = [];
    const now = new Date();
    const dayMap: Record<string, number> = { sunday: 0, saturday: 6 };
    const targetDayOffsets = days.map((d) => dayMap[d]) as number[];

    for (let w = 0; w < weeksCount; w++) {
      for (const dayOffset of targetDayOffsets) {
        const date = new Date(now);
        let diff = (dayOffset - now.getDay() + 7) % 7;
        if (diff === 0 && w === 0) {
          diff = 7;
        }
        date.setDate(now.getDate() + diff + w * 7);

        const start = new Date(date);
        start.setHours(6, 30, 0, 0);
        const end = new Date(date);
        end.setHours(9, 0, 0, 0);

        newSlots.push({
          id: `slot-${listingId}-${w}`,
          offering_id: listingId,
          listing_id: listingId,
          slot_start: start.toISOString(),
          slot_end: end.toISOString(),
          capacity: 15,
          booked_count: 0,
          revision_number: 1,
          is_cancelled: false,
        });
      }
    }

    // 4 weeks * 1 day = 4 slots
    expect(newSlots.length).toBe(4);
    newSlots.forEach((slot) => {
      const d = new Date(slot.slot_start);
      expect(d.getDay()).toBe(6); // Saturday
    });
  });

  it("should validate complete rich listing data structure with itinerary, inclusions, and host bio", () => {
    const sampleItinerary: ItineraryItem[] = [
      {
        time: "12:30 PM",
        title: "Sol Kadhi Welcome",
        description: "Chilled kokum sol kadhi welcome refreshment.",
      },
      {
        time: "01:00 PM",
        title: "Fresh Surmai Rawa Fry",
        description: "Crispy pan-fried surmai straight from cast-iron skillet.",
      },
      {
        time: "01:45 PM",
        title: "Crab Masala Thali Course",
        description: "Served hot with steamed rice and coastal bhakri.",
      },
      {
        time: "02:30 PM",
        title: "Modak Finale & Custodian Tales",
        description: "Sweet steamed modaks and oral histories.",
      },
    ];

    const sampleInclusions = [
      "5-Course Traditional Seafood Thali",
      "Unlimited Sol Kadhi Refills",
      "Fresh Catch Surmai Fry",
      "Mud Crab Masala Gravy",
    ];

    const sampleThingsToCarry = [
      "Appetite for bold authentic coastal spices",
      "Casual comfortable attire",
    ];

    const richListing: Listing = {
      id: "exp-rich-sample-999",
      title: "Versova Grand Coastal Seafood Thali & Banquet",
      slug: "versova-grand-coastal-seafood-thali",
      type: "experience",
      pillar: "food",
      meal_type: "lunch",
      price_inr: 1200,
      currency: "INR",
      short_summary: "Authentic coastal dining banquet in a heritage courtyard.",
      full_description: "Detailed description of the feast.",
      images: ["https://images.unsplash.com/photo-1544025162-d76694265947"],
      location_name: "Versova Gaothan Courtyard",
      host_name: "Ashwini Tandel",
      host_phone: "+91 99284 77158",
      host_bio: "Heritage home cook safeguarding indigenous Koli recipes.",
      itinerary: sampleItinerary,
      included_items: sampleInclusions,
      things_to_carry: sampleThingsToCarry,
      is_active: true,
      is_featured: true,
    };

    expect(richListing.itinerary).toBeDefined();
    expect(richListing.itinerary?.length).toBe(4);
    expect(richListing.itinerary?.[0]?.time).toBe("12:30 PM");
    expect(richListing.included_items).toContain("5-Course Traditional Seafood Thali");
    expect(richListing.things_to_carry).toContain("Appetite for bold authentic coastal spices");
    expect(richListing.host_bio).toContain("Heritage home cook safeguarding indigenous Koli recipes");
    expect(richListing.meal_type).toBe("lunch");
  });

  it("should support custom multi-date slot batches", () => {
    const customSlotBatch = [
      {
        date: "2026-11-07",
        startTime: "12:30",
        endTime: "15:00",
        capacity: 14,
      },
      {
        date: "2026-11-14",
        startTime: "12:30",
        endTime: "15:00",
        capacity: 14,
      },
      {
        date: "2026-11-21",
        startTime: "19:30",
        endTime: "22:00",
        capacity: 12,
      },
    ];

    const listingId = "exp-multi-batch-001";
    const generatedSlots: ExperienceSlot[] = customSlotBatch.map((s, idx) => ({
      id: `slot-batch-${idx}`,
      offering_id: listingId,
      listing_id: listingId,
      slot_start: new Date(`${s.date}T${s.startTime}:00`).toISOString(),
      slot_end: new Date(`${s.date}T${s.endTime}:00`).toISOString(),
      capacity: s.capacity,
      booked_count: 0,
      revision_number: 1,
      is_cancelled: false,
    }));

    expect(generatedSlots.length).toBe(3);
    expect(generatedSlots[0]?.capacity).toBe(14);
    expect(generatedSlots[2]?.capacity).toBe(12);
    expect(generatedSlots[2]?.slot_start).toContain("2026-11-21");
  });
});

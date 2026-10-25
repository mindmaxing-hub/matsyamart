import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Button,
  Hr,
  Preview,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

export interface BookingItemSummary {
  title: string;
  quantity: number;
  unitPrice: number;
  pillar?: string;
  type?: "experience" | "product";
}

export interface BookingConfirmationEmailProps {
  orderRef?: string;
  customerName?: string;
  customerEmail?: string;
  experienceTitle?: string;
  pillar?: string;
  seatsCount?: number;
  totalAmountInr?: number;
  dateFormatted?: string;
  timeFormatted?: string;
  meetingAddress?: string;
  mapsUrl?: string;
  passUrl?: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
  gstin?: string;
  taxableValueInr?: number;
  gstAmountInr?: number;
  cgstInr?: number;
  sgstInr?: number;
  items?: BookingItemSummary[];
  shippingAddress?: {
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export type EmailCategory = "food" | "walk" | "workshop" | "goods";

export function resolveEmailCategory(
  pillar?: string,
  title?: string,
  orderRef?: string,
): EmailCategory {
  const ref = (orderRef || "").toUpperCase();
  if (ref.includes("-WK-") || ref.includes("WK")) return "walk";
  if (ref.includes("-FD-") || ref.includes("FD")) return "food";
  if (ref.includes("-WS-") || ref.includes("WS")) return "workshop";
  if (ref.includes("-GD-") || ref.includes("GD") || ref.includes("-PRD-")) return "goods";

  const p = (pillar || "").toLowerCase();
  if (p === "walks" || p === "walk") return "walk";
  if (p === "workshops" || p === "workshop") return "workshop";
  if (p === "food") return "food";
  if (p === "goods" || p === "products" || p === "product") return "goods";

  const t = (title || "").toLowerCase();
  if (
    t.includes("walk") ||
    t.includes("trail") ||
    t.includes("tour") ||
    t.includes("heritage") ||
    t.includes("safari")
  ) {
    return "walk";
  }
  if (
    t.includes("workshop") ||
    t.includes("weaving") ||
    t.includes("craft") ||
    t.includes("carpentry") ||
    t.includes("boatyard")
  ) {
    return "workshop";
  }
  if (
    t.includes("feast") ||
    t.includes("thali") ||
    t.includes("dining") ||
    t.includes("food") ||
    t.includes("crab") ||
    t.includes("meal")
  ) {
    return "food";
  }
  if (
    t.includes("fish") ||
    t.includes("oil") ||
    t.includes("honey") ||
    t.includes("masala") ||
    t.includes("goods")
  ) {
    return "goods";
  }

  return "walk";
}

interface ThemePalette {
  mainBg: string;
  cardBg: string;
  headerBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  badgeText: string;
  titleColor: string;
  refColor: string;
  sectionTitleColor: string;
  labelColor: string;
  valueColor: string;
  dividerBorder: string;
  venueBg: string;
  venueBorder: string;
  venueColor: string;
  mapsBtnBg: string;
  mapsBtnColor: string;
  mapsBtnBorder: string;
  passBoxBg: string;
  passBoxBorder: string;
  passBoxHeading: string;
  passBoxSub: string;
  passBtnBg: string;
  passBtnColor: string;
  inlineLinkColor: string;
  footerBg: string;
  footerText: string;
  footerSubText: string;
}

const THEMES: Record<EmailCategory, ThemePalette> = {
  food: {
    mainBg: "#0e1a29",
    cardBg: "#1c3554",
    headerBg: "#152942",
    cardBorder: "1px solid rgba(64, 104, 130, 0.4)",
    badgeBg: "#152942",
    badgeBorder: "1px solid rgba(227, 161, 87, 0.4)",
    badgeColor: "#e3a157",
    badgeText: "🐟 Confirmed Coastal Food Feast & Tax Invoice",
    titleColor: "#f8fafc",
    refColor: "#94a3b8",
    sectionTitleColor: "#e3a157",
    labelColor: "#94a3b8",
    valueColor: "#f8fafc",
    dividerBorder: "1px solid rgba(64, 104, 130, 0.35)",
    venueBg: "#152942",
    venueBorder: "1px solid rgba(64, 104, 130, 0.5)",
    venueColor: "#f1f5f9",
    mapsBtnBg: "#152942",
    mapsBtnColor: "#cbd5e1",
    mapsBtnBorder: "1px solid rgba(64, 104, 130, 0.5)",
    passBoxBg: "#152942",
    passBoxBorder: "1px solid rgba(227, 161, 87, 0.35)",
    passBoxHeading: "#e3a157",
    passBoxSub: "#cbd5e1",
    passBtnBg: "#e3a157",
    passBtnColor: "#152942",
    inlineLinkColor: "#e3a157",
    footerBg: "#0e1a29",
    footerText: "#94a3b8",
    footerSubText: "rgba(148, 163, 184, 0.7)",
  },
  walk: {
    mainBg: "#2e5258",
    cardBg: "#5f98a0",
    headerBg: "#4d828a",
    cardBorder: "1px solid rgba(255, 255, 255, 0.3)",
    badgeBg: "#3e6d74",
    badgeBorder: "1px solid rgba(255, 255, 255, 0.45)",
    badgeColor: "#ffffff",
    badgeText: "🌊 Confirmed Coastal Heritage Walk & Tax Invoice",
    titleColor: "#102030", // High contrast deep marine navy
    refColor: "#1b2b49",
    sectionTitleColor: "#102030",
    labelColor: "#e6fffa",
    valueColor: "#ffffff",
    dividerBorder: "1px solid rgba(255, 255, 255, 0.25)",
    venueBg: "#4d828a",
    venueBorder: "1px solid rgba(255, 255, 255, 0.35)",
    venueColor: "#ffffff",
    mapsBtnBg: "#3e6d74",
    mapsBtnColor: "#ffffff",
    mapsBtnBorder: "1px solid rgba(255, 255, 255, 0.4)",
    passBoxBg: "#4d828a",
    passBoxBorder: "1px solid rgba(255, 255, 255, 0.4)",
    passBoxHeading: "#ffffff",
    passBoxSub: "#f0fdfa",
    passBtnBg: "#102030",
    passBtnColor: "#ffffff",
    inlineLinkColor: "#102030",
    footerBg: "#2e5258",
    footerText: "#e6fffa",
    footerSubText: "rgba(230, 255, 250, 0.7)",
  },
  workshop: {
    mainBg: "#170906",
    cardBg: "#2b120c",
    headerBg: "#220e09",
    cardBorder: "1px solid rgba(218, 179, 140, 0.25)",
    badgeBg: "#35160e",
    badgeBorder: "1px solid rgba(227, 161, 87, 0.4)",
    badgeColor: "#e3a157",
    badgeText: "🪵 Confirmed Coastal Craft Workshop & Tax Invoice",
    titleColor: "#f5edeb",
    refColor: "#dab38c",
    sectionTitleColor: "#e3a157",
    labelColor: "#dab38c",
    valueColor: "#f5edeb",
    dividerBorder: "1px solid rgba(218, 179, 140, 0.2)",
    venueBg: "#220e09",
    venueBorder: "1px solid rgba(218, 179, 140, 0.25)",
    venueColor: "#f5edeb",
    mapsBtnBg: "#35160e",
    mapsBtnColor: "#dab38c",
    mapsBtnBorder: "1px solid rgba(218, 179, 140, 0.3)",
    passBoxBg: "#220e09",
    passBoxBorder: "1px solid rgba(227, 161, 87, 0.3)",
    passBoxHeading: "#e3a157",
    passBoxSub: "#dab38c",
    passBtnBg: "#e3a157",
    passBtnColor: "#2b120c",
    inlineLinkColor: "#e3a157",
    footerBg: "#170906",
    footerText: "#dab38c",
    footerSubText: "rgba(218, 179, 140, 0.6)",
  },
  goods: {
    mainBg: "#140604",
    cardBg: "#1f0b07",
    headerBg: "#29100b",
    cardBorder: "1px solid rgba(16, 185, 129, 0.3)",
    badgeBg: "#143825",
    badgeBorder: "1px solid rgba(52, 211, 153, 0.4)",
    badgeColor: "#34d399",
    badgeText: "📦 Confirmed Artisanal Coastal Goods & Tax Invoice",
    titleColor: "#f5edeb",
    refColor: "#dab38c",
    sectionTitleColor: "#34d399",
    labelColor: "#dab38c",
    valueColor: "#f5edeb",
    dividerBorder: "1px solid rgba(218, 179, 140, 0.2)",
    venueBg: "#29100b",
    venueBorder: "1px solid rgba(218, 179, 140, 0.2)",
    venueColor: "#f5edeb",
    mapsBtnBg: "#143825",
    mapsBtnColor: "#34d399",
    mapsBtnBorder: "1px solid rgba(52, 211, 153, 0.4)",
    passBoxBg: "#29100b",
    passBoxBorder: "1px solid rgba(52, 211, 153, 0.3)",
    passBoxHeading: "#34d399",
    passBoxSub: "#dab38c",
    passBtnBg: "#10b981",
    passBtnColor: "#06281b",
    inlineLinkColor: "#34d399",
    footerBg: "#140604",
    footerText: "#dab38c",
    footerSubText: "rgba(218, 179, 140, 0.6)",
  },
};

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = (
  props
) => {
  const orderRef = props?.orderRef || "MM-EXP-2026-0042";
  const customerName = props?.customerName || "Aryan Panchal";
  const customerEmail = props?.customerEmail || "hello@matsyamart.com";
  const experienceTitle =
    props?.experienceTitle || "Versova Coastal Heritage & Seafood Feast";
  const seatsCount = props?.seatsCount ?? 2;
  const totalAmountInr = props?.totalAmountInr ?? 2900;
  const dateFormatted = props?.dateFormatted || "Sunday, 12 December 2026";
  const timeFormatted = props?.timeFormatted || "1:00 PM IST";
  const meetingAddress =
    props?.meetingAddress ||
    "Versova Gaothan Dining Courtyard, Andheri West, Mumbai - 400061";

  // Normalize Google Maps link to canonical cross-platform search format
  const rawMapsUrl = props?.mapsUrl;
  const mapsUrl = rawMapsUrl
    ? rawMapsUrl.startsWith("https://maps.google.com/?q=")
      ? rawMapsUrl.replace(
          "https://maps.google.com/?q=",
          "https://www.google.com/maps/search/?api=1&query=",
        )
      : rawMapsUrl
    : meetingAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          meetingAddress,
        )}`
      : undefined;

  const passUrl =
    props?.passUrl ||
    `https://matsyamart.com/order/confirmation/${orderRef}`;
  const invoiceUrl =
    props?.invoiceUrl ||
    `https://matsyamart.com/order/confirmation/${orderRef}?view=invoice`;
  const invoiceNumber = props?.invoiceNumber || `INV-${orderRef}`;
  const gstin = props?.gstin || "27ABBFK9637R1ZF";

  // Dynamic Category Resolution based on pillar, title, and orderRef
  const category = resolveEmailCategory(props?.pillar, experienceTitle, orderRef);
  const theme = THEMES[category];

  // 18% GST Calculations (inclusive)
  const taxableValue =
    props?.taxableValueInr ??
    Math.round((totalAmountInr / 1.18) * 100) / 100;
  const totalGst =
    props?.gstAmountInr ??
    Math.round((totalAmountInr - taxableValue) * 100) / 100;

  // State-based tax breakdown (Intra-state Maharashtra vs Inter-state IGST)
  const shipping = props?.shippingAddress;
  const shippingState = shipping?.state?.trim().toLowerCase();
  const isInterState = Boolean(
    shippingState &&
      shippingState !== "maharashtra" &&
      shippingState !== "mh" &&
      shippingState !== "27",
  );
  const cgst = isInterState
    ? 0
    : props?.cgstInr ?? Math.round((totalGst / 2) * 100) / 100;
  const sgst = isInterState
    ? 0
    : props?.sgstInr ?? Math.round((totalGst - cgst) * 100) / 100;
  const igst = isInterState ? totalGst : 0;

  const itemsList =
    props?.items && props.items.length > 0
      ? props.items
      : [
          {
            title: experienceTitle,
            quantity: seatsCount,
            unitPrice: Math.round(totalAmountInr / Math.max(1, seatsCount)),
            pillar: props?.pillar || "food",
          },
        ];

  return (
    <Html>
      <Head />
      <Preview>
        Pass &amp; Tax Invoice for {experienceTitle} ({orderRef})
      </Preview>
      <Body
        style={{
          backgroundColor: theme.mainBg,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "32px 16px",
        }}
      >
        <Container style={{ maxWidth: "580px", margin: "0 auto" }}>
          {/* Main Card Wrapper */}
          <Section
            style={{
              backgroundColor: theme.cardBg,
              border: theme.cardBorder,
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Header */}
            <Section
              style={{
                padding: "32px 24px 24px",
                textAlign: "center" as const,
                backgroundColor: theme.headerBg,
                borderBottom: "1px dashed rgba(255, 255, 255, 0.15)",
              }}
            >
              <Text
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  backgroundColor: theme.badgeBg,
                  border: theme.badgeBorder,
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: theme.badgeColor,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  margin: "0 0 12px",
                }}
              >
                {theme.badgeText}
              </Text>
              <Heading
                as="h1"
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: theme.titleColor,
                  margin: "0 0 8px",
                  lineHeight: "1.25",
                }}
              >
                {experienceTitle}
              </Heading>
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: theme.refColor,
                  letterSpacing: "0.1em",
                  margin: "0",
                }}
              >
                PASS REF: {orderRef}
              </Text>
            </Section>

            {/* Content Details */}
            <Section style={{ padding: "24px 28px" }}>
              {/* Guest & Attendance */}
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: theme.sectionTitleColor,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  margin: "0 0 12px",
                }}
              >
                GUEST &amp; ATTENDANCE
              </Text>
              <Section style={{ marginBottom: "8px" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: theme.labelColor,
                    margin: "0 0 2px",
                  }}
                >
                  Guest Name:
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: theme.valueColor,
                    margin: "0 0 8px",
                  }}
                >
                  <b>{customerName}</b>
                </Text>
              </Section>
              <Section style={{ marginBottom: "8px" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: theme.labelColor,
                    margin: "0 0 2px",
                  }}
                >
                  Registered Email:
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: theme.valueColor,
                    margin: "0 0 8px",
                  }}
                >
                  <b>{customerEmail}</b>
                </Text>
              </Section>
              <Section style={{ marginBottom: "8px" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: theme.labelColor,
                    margin: "0 0 2px",
                  }}
                >
                  Reserved Seats:
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: theme.valueColor,
                    margin: "0 0 8px",
                  }}
                >
                  {seatsCount} Guest(s)
                </Text>
              </Section>
              <Section style={{ marginBottom: "8px" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: theme.labelColor,
                    margin: "0 0 2px",
                  }}
                >
                  Scheduled Date:
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: theme.valueColor,
                    margin: "0 0 8px",
                  }}
                >
                  <b>{dateFormatted}</b>
                </Text>
              </Section>
              <Section style={{ marginBottom: "8px" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: theme.labelColor,
                    margin: "0 0 2px",
                  }}
                >
                  Reporting Time:
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: theme.valueColor,
                    margin: "0 0 8px",
                  }}
                >
                  <b>{timeFormatted}</b>
                </Text>
              </Section>

              {/* Physical Delivery Address (if present) */}
              {shipping && shipping.addressLine && (
                <>
                  <Hr
                    style={{
                      borderTop: theme.dividerBorder,
                      margin: "20px 0",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: theme.sectionTitleColor,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.1em",
                      margin: "0 0 12px",
                    }}
                  >
                    DELIVERY SHIPPING ADDRESS
                  </Text>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: theme.venueColor,
                      backgroundColor: theme.venueBg,
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: theme.venueBorder,
                      margin: "0",
                      lineHeight: "1.5",
                    }}
                  >
                    {shipping.addressLine}
                    {shipping.city ? `, ${shipping.city}` : ""}
                    {shipping.state ? `, ${shipping.state}` : ""}
                    {shipping.pincode ? ` – ${shipping.pincode}` : ""}
                  </Text>
                </>
              )}

              {/* Rendezvous Point */}
              {meetingAddress && (
                <>
                  <Hr
                    style={{
                      borderTop: theme.dividerBorder,
                      margin: "20px 0",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: theme.sectionTitleColor,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.1em",
                      margin: "0 0 12px",
                    }}
                  >
                    RENDEZVOUS &amp; GPS MEETING PIN
                  </Text>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: theme.venueColor,
                      backgroundColor: theme.venueBg,
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: theme.venueBorder,
                      margin: "0",
                      lineHeight: "1.5",
                    }}
                  >
                    {meetingAddress}
                  </Text>

                  {mapsUrl && (
                    <Section
                      style={{ textAlign: "center", margin: "14px 0 20px" }}
                    >
                      <Button
                        href={mapsUrl}
                        style={{
                          backgroundColor: theme.mapsBtnBg,
                          color: theme.mapsBtnColor,
                          border: theme.mapsBtnBorder,
                          fontWeight: "600",
                          fontSize: "12px",
                          padding: "10px 20px",
                          borderRadius: "999px",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        📍 Open Meeting Point in Google Maps
                      </Button>
                    </Section>
                  )}
                </>
              )}

              <Hr
                style={{
                  borderTop: theme.dividerBorder,
                  margin: "20px 0",
                }}
              />

              {/* Mobile Boarding Pass CTA */}
              <Section
                style={{
                  backgroundColor: theme.passBoxBg,
                  borderRadius: "16px",
                  padding: "20px",
                  textAlign: "center" as const,
                  border: theme.passBoxBorder,
                }}
              >
                <Text
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: theme.passBoxHeading,
                    margin: "0 0 6px",
                  }}
                >
                  📲 Digital Boarding Pass Ready
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    color: theme.passBoxSub,
                    margin: "0 0 16px",
                    lineHeight: "1.4",
                  }}
                >
                  Tap below to open your secure QR boarding pass on any mobile
                  browser. Keep it handy at the check-in gate.
                </Text>
                <Button
                  href={passUrl}
                  style={{
                    backgroundColor: theme.passBtnBg,
                    color: theme.passBtnColor,
                    fontWeight: "700",
                    fontSize: "13px",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  🎫 Open Boarding Pass on Mobile
                </Button>
                {/* Clean, single-line fallback link without raw base64 dumping */}
                <Text
                  style={{
                    fontSize: "11px",
                    color: theme.labelColor,
                    marginTop: "12px",
                    marginBottom: "0",
                  }}
                >
                  Direct link:{" "}
                  <Link
                    href={passUrl}
                    style={{
                      color: theme.inlineLinkColor,
                      textDecoration: "underline",
                      fontWeight: "600",
                    }}
                  >
                    matsyamart.com/order/confirmation/{orderRef}
                  </Link>
                </Text>
              </Section>

              <Hr
                style={{
                  borderTop: theme.dividerBorder,
                  margin: "20px 0",
                }}
              />

              {/* Official GST Tax Invoice Card */}
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: theme.sectionTitleColor,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  margin: "0 0 12px",
                }}
              >
                OFFICIAL GST TAX INVOICE &amp; RECEIPT
              </Text>
              <Section
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "22px 20px",
                  border: "1px solid rgba(0, 0, 0, 0.15)",
                  color: "#000000",
                }}
              >
                {/* Official Supplier Details */}
                <Section style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#000000",
                      margin: "0 0 4px",
                    }}
                  >
                    Kolibaba Seafood Inc.
                  </Text>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#475569",
                      lineHeight: "1.5",
                      margin: "0",
                    }}
                  >
                    <b>Registered Address:</b> 101, Samudra Darshan, Budha Lane
                    2, Versova, Andheri West, Mumbai – 400061
                    <br />
                    <b>GSTIN:</b> {gstin} (State Code: 27 · Maharashtra)
                    <br />
                    <b>Email:</b> hello@matsyamart.com · <b>Support:</b> +91
                    76665 11511
                  </Text>
                </Section>

                {/* Invoice Meta Grid */}
                <Section
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "12px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#0f172a",
                      margin: "2px 0",
                      fontFamily: "monospace",
                    }}
                  >
                    <b>Invoice No:</b> {invoiceNumber}
                  </Text>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#0f172a",
                      margin: "2px 0",
                      fontFamily: "monospace",
                    }}
                  >
                    <b>Order Ref:</b> {orderRef}
                  </Text>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#0f172a",
                      margin: "2px 0",
                      fontFamily: "monospace",
                    }}
                  >
                    <b>Payment:</b> ONLINE (RAZORPAY) · PAID
                  </Text>
                </Section>

                <Hr
                  style={{
                    borderTop: "1px dashed #cbd5e1",
                    margin: "12px 0",
                  }}
                />

                {/* Itemized Table */}
                <Section style={{ margin: "10px 0" }}>
                  <Text
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#64748b",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      margin: "0 0 8px",
                    }}
                  >
                    ITEMIZED BREAKDOWN
                  </Text>
                  {itemsList.map((item, idx) => (
                    <Section
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#1e293b",
                          margin: "0",
                        }}
                      >
                        {item.title} (x{item.quantity})
                      </Text>
                      <Text
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#0f172a",
                          margin: "0",
                          fontFamily: "monospace",
                        }}
                      >
                        ₹
                        {(item.unitPrice * item.quantity).toLocaleString(
                          "en-IN"
                        )}
                      </Text>
                    </Section>
                  ))}
                </Section>

                <Hr
                  style={{
                    borderTop: "1px dashed #cbd5e1",
                    margin: "12px 0",
                  }}
                />

                {/* Tax Breakdown */}
                <Section
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      margin: "0",
                    }}
                  >
                    Taxable Value (Subtotal):
                  </Text>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#0f172a",
                      margin: "0",
                      fontFamily: "monospace",
                    }}
                  >
                    ₹{taxableValue.toFixed(2)}
                  </Text>
                </Section>
                {isInterState ? (
                  <Section
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        margin: "0",
                      }}
                    >
                      IGST (18.0%):
                    </Text>
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#0f172a",
                        margin: "0",
                        fontFamily: "monospace",
                      }}
                    >
                      ₹{igst.toFixed(2)}
                    </Text>
                  </Section>
                ) : (
                  <>
                    <Section
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          margin: "0",
                        }}
                      >
                        CGST (9.0%):
                      </Text>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#0f172a",
                          margin: "0",
                          fontFamily: "monospace",
                        }}
                      >
                        ₹{cgst.toFixed(2)}
                      </Text>
                    </Section>
                    <Section
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          margin: "0",
                        }}
                      >
                        SGST (9.0%):
                      </Text>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#0f172a",
                          margin: "0",
                          fontFamily: "monospace",
                        }}
                      >
                        ₹{sgst.toFixed(2)}
                      </Text>
                    </Section>
                  </>
                )}
                <Section
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      margin: "0",
                    }}
                  >
                    Total GST (18.0%):
                  </Text>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#0f172a",
                      margin: "0",
                      fontFamily: "monospace",
                    }}
                  >
                    ₹{totalGst.toFixed(2)}
                  </Text>
                </Section>
                <Section
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    paddingTop: "10px",
                    borderTop: "2px solid #0f172a",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: "0",
                    }}
                  >
                    NET AMOUNT PAID:
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: "0",
                      fontFamily: "monospace",
                    }}
                  >
                    ₹{totalAmountInr.toLocaleString("en-IN")}
                  </Text>
                </Section>

                {/* Strategic Partnership Footer in Tax Invoice */}
                <Section
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid #e2e8f0",
                    textAlign: "center" as const,
                  }}
                >
                  <Text
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      margin: "0 0 2px",
                      lineHeight: "1.4",
                    }}
                  >
                    In strategic partnership with{" "}
                    <b>Bhoomiputra Foundation</b> · Preserving indigenous Koli
                    culture
                  </Text>
                  <Text
                    style={{
                      fontSize: "9px",
                      color: "#94a3b8",
                      margin: "0",
                    }}
                  >
                    Valid digital invoice &amp; admission voucher · Subject to
                    Mumbai jurisdiction
                  </Text>
                </Section>

                {/* Invoice Button CTA */}
                <Section style={{ textAlign: "center", marginTop: "18px" }}>
                  <Button
                    href={invoiceUrl}
                    style={{
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: "12px",
                      padding: "11px 22px",
                      borderRadius: "999px",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    🧾 View &amp; Print Official Tax Invoice (PDF)
                  </Button>
                  {/* Clean, single-line fallback link */}
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "10px",
                      marginBottom: "0",
                    }}
                  >
                    Direct link:{" "}
                    <Link
                      href={invoiceUrl}
                      style={{
                        color: "#0f172a",
                        textDecoration: "underline",
                        fontWeight: "600",
                      }}
                    >
                      matsyamart.com/order/confirmation/{orderRef}?view=invoice
                    </Link>
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* Email Global Footer */}
            <Section
              style={{
                padding: "20px 24px",
                textAlign: "center" as const,
                backgroundColor: theme.footerBg,
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: "11px",
                  color: theme.footerText,
                  margin: "0 0 4px",
                }}
              >
                Dispatched from <b>hello@matsyamart.com</b>
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  color: theme.footerSubText,
                  margin: "0 0 2px",
                }}
              >
                Kolibaba Seafood Inc. · In strategic partnership with
                Bhoomiputra Foundation
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  color: theme.footerSubText,
                  margin: "0 0 2px",
                }}
              >
                101, Samudra Darshan, Budha Lane 2, Versova, Andheri West,
                Mumbai – 400061
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  color: theme.footerSubText,
                  margin: "0",
                }}
              >
                Support: hello@matsyamart.com · +91 76665 11511 / +91 99204
                77158
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const template: TemplateEntry = {
  component: BookingConfirmationEmail,
  subject: (data) =>
    `Pass & Tax Invoice · ${String(data?.["orderRef"] || "MatsyaMart")}`,
  displayName: "Booking Confirmation, Pass & Tax Invoice",
  previewData: {
    orderRef: "MM-EXP-2026-0042",
    customerName: "Aryan Panchal",
    customerEmail: "aryan@example.com",
    experienceTitle: "Versova Coastal Heritage & Seafood Feast",
    pillar: "food",
    seatsCount: 2,
    totalAmountInr: 2900,
    dateFormatted: "Sunday, 12 December 2026",
    timeFormatted: "1:00 PM IST",
    meetingAddress:
      "Versova Gaothan Dining Courtyard, Andheri West, Mumbai - 400061",
    mapsUrl: "https://maps.app.goo.gl/TfKpsZPCyisNzSXv6",
    passUrl: "https://matsyamart.com/order/confirmation/MM-EXP-2026-0042",
    invoiceUrl:
      "https://matsyamart.com/order/confirmation/MM-EXP-2026-0042?view=invoice",
    invoiceNumber: "INV-MM-EXP-2026-0042",
    gstin: "27ABBFK9637R1ZF",
    taxableValueInr: 2457.63,
    gstAmountInr: 442.37,
    cgstInr: 221.19,
    sgstInr: 221.18,
    items: [
      {
        title: "Versova Coastal Heritage & Seafood Feast",
        quantity: 2,
        unitPrice: 1450,
        pillar: "food",
      },
    ],
  },
};

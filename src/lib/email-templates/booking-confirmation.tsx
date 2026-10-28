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
  attendees?: string[];
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
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  badgeText: string;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  accentGradient: string;
  ctaBg: string;
  ctaColor: string;
  accentBadgeBg: string;
  pinLinkColor: string;
}

// Apple design system theme accents: light canvas with vibrant, category-true coastal accents
const THEMES: Record<EmailCategory, ThemePalette> = {
  food: {
    badgeBg: "#fff7ed",
    badgeBorder: "1px solid #fdba74",
    badgeColor: "#b93815",
    badgeText: "🐟 Confirmed Coastal Food Feast & Tax Invoice",
    accentColor: "#b93815", // Warm Coastal Terracotta
    cardBg: "#fffbf6",
    cardBorder: "#fed7aa",
    accentGradient: "linear-gradient(90deg, #b93815 0%, #e3a157 100%)",
    ctaBg: "#b93815",
    ctaColor: "#ffffff",
    accentBadgeBg: "#ffedd5",
    pinLinkColor: "#b93815",
  },
  walk: {
    badgeBg: "#f0fdfa",
    badgeBorder: "1px solid #99f6e4",
    badgeColor: "#0e4a60",
    badgeText: "🌊 Confirmed Coastal Heritage Walk & Tax Invoice",
    accentColor: "#0e4a60", // Deep Maritime Ocean
    cardBg: "#f4fbfb",
    cardBorder: "#99f6e4",
    accentGradient: "linear-gradient(90deg, #0e4a60 0%, #14b8a6 100%)",
    ctaBg: "#0e4a60",
    ctaColor: "#ffffff",
    accentBadgeBg: "#ccfbf1",
    pinLinkColor: "#0e4a60",
  },
  workshop: {
    badgeBg: "#faf5ff",
    badgeBorder: "1px solid #e9d5ff",
    badgeColor: "#432874",
    badgeText: "🪵 Confirmed Coastal Craft Workshop & Tax Invoice",
    accentColor: "#432874", // Craft Indigo/Violet
    cardBg: "#faf7fe",
    cardBorder: "#e9d5ff",
    accentGradient: "linear-gradient(90deg, #432874 0%, #8b5cf6 100%)",
    ctaBg: "#432874",
    ctaColor: "#ffffff",
    accentBadgeBg: "#f3e8ff",
    pinLinkColor: "#432874",
  },
  goods: {
    badgeBg: "#ecfdf5",
    badgeBorder: "1px solid #a7f3d0",
    badgeColor: "#065f46",
    badgeText: "📦 Confirmed Artisanal Coastal Goods & Tax Invoice",
    accentColor: "#059669", // Coastal Forest Emerald
    cardBg: "#f5fbf7",
    cardBorder: "#a7f3d0",
    accentGradient: "linear-gradient(90deg, #059669 0%, #34d399 100%)",
    ctaBg: "#059669",
    ctaColor: "#ffffff",
    accentBadgeBg: "#d1fae5",
    pinLinkColor: "#059669",
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

  const category = resolveEmailCategory(props?.pillar, experienceTitle, orderRef);
  const theme = THEMES[category];
  const isGoodsOrder =
    category === "goods" ||
    (props?.items &&
      props.items.length > 0 &&
      props.items.every(
        (it) => it.type === "product" || it.pillar === "goods",
      ));

  const meetingAddress = isGoodsOrder
    ? undefined
    : (props?.meetingAddress || "Versova Gaothan Dining Courtyard, Andheri West, Mumbai - 400061");

  // Google Maps link
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

  // GST calculations
  const taxableValue =
    props?.taxableValueInr ??
    Math.round((totalAmountInr / 1.18) * 100) / 100;
  const totalGst =
    props?.gstAmountInr ??
    Math.round((totalAmountInr - taxableValue) * 100) / 100;

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

  interface EmailPassTicket {
    ticketNumber: number;
    title: string;
    attendeeName: string;
  }

  const passTickets: EmailPassTicket[] = [];
  let ticketCounter = 1;
  itemsList.forEach((it) => {
    if (it.type !== "product") {
      const count = Math.max(1, it.quantity);
      for (let sIdx = 0; sIdx < count; sIdx++) {
        const attendeeName =
          it.attendees?.[sIdx] ||
          (sIdx === 0 ? customerName : `Guest ${sIdx + 1} (${customerName})`);
        passTickets.push({
          ticketNumber: ticketCounter++,
          title: it.title,
          attendeeName,
        });
      }
    }
  });

  return (
    <Html>
      <Head />
      <Preview>
        {isGoodsOrder
          ? `Order Receipt & Tax Invoice for ${experienceTitle} (${orderRef})`
          : `Pass & Tax Invoice for ${experienceTitle} (${orderRef})`}
      </Preview>
      <Body
        style={{
          backgroundColor: "#f5f5f7",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          margin: "0",
          padding: "36px 12px",
          color: "#1d1d1f",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e5e5ea",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Category Signature Top Accent Stripe */}
          <div style={{ height: "5px", background: theme.accentGradient }} />

          {/* Minimalist Apple Brand Header */}
          <Section
            style={{
              padding: "24px 32px 18px",
              borderBottom: "1px solid #f0f0f2",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        fontWeight: "700",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: theme.accentColor,
                      }}
                    >
                      {isGoodsOrder ? "MATSYAMART · OFFICIAL ORDER RECEIPT" : "MATSYAMART · OFFICIAL PASS"}
                    </Text>
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle" }}>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        fontFamily: "ui-monospace, 'SF Mono', monospace",
                        color: "#86868b",
                      }}
                    >
                      {orderRef}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Hero Experience Section */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.04em",
                  backgroundColor: theme.badgeBg,
                  border: theme.badgeBorder,
                  color: theme.badgeColor,
                }}
              >
                {theme.badgeText}
              </span>
            </div>

            <Heading
              as="h1"
              style={{
                fontSize: "24px",
                fontWeight: "700",
                lineHeight: "1.25",
                color: "#1d1d1f",
                margin: "0 0 8px",
                letterSpacing: "-0.015em",
              }}
            >
              {experienceTitle}
            </Heading>

            <Text
              style={{
                margin: "0",
                fontSize: "14px",
                color: "#6e6e73",
                lineHeight: "1.4",
              }}
            >
              {isGoodsOrder ? (
                <>Order placed by <b>{customerName}</b> ({customerEmail})</>
              ) : (
                <>Reserved for <b>{customerName}</b> ({customerEmail})</>
              )}
            </Text>
          </Section>

          {/* Apple Wallet-Style Boarding Pass or Goods Fulfillment Card */}
          <Section style={{ padding: "0 32px 28px" }}>
            <div
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: "16px",
                border: `1px solid ${theme.cardBorder}`,
                borderTop: `3px solid ${theme.accentColor}`,
                padding: "24px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
              }}
            >
              {isGoodsOrder ? (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "50%", verticalAlign: "top", paddingRight: "12px" }}>
                          <Text
                            style={{
                              margin: "0 0 4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#86868b",
                            }}
                          >
                            ESTIMATED DISPATCH
                          </Text>
                          <Text
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1d1d1f",
                              lineHeight: "1.35",
                            }}
                          >
                            Handcrafted Dawn Catch
                          </Text>
                          <Text
                            style={{
                              margin: "2px 0 0",
                              fontSize: "13px",
                              color: "#6e6e73",
                            }}
                          >
                            Ships within 24 - 48 Hours
                          </Text>
                        </td>

                        <td style={{ width: "50%", verticalAlign: "top", paddingLeft: "12px" }}>
                          <Text
                            style={{
                              margin: "0 0 4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#86868b",
                            }}
                          >
                            ORDER FULFILLMENT
                          </Text>
                          <Text
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1d1d1f",
                              lineHeight: "1.35",
                            }}
                          >
                            Confirmed &amp; Dock Packing
                          </Text>
                          <Text
                            style={{
                              margin: "2px 0 0",
                              fontSize: "13px",
                              color: "#6e6e73",
                            }}
                          >
                            {itemsList.reduce((acc, it) => acc + it.quantity, 0)} Items Ordered
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Delivery Address for Goods */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "12px",
                      backgroundColor: "#ffffff",
                      border: `1px solid ${theme.cardBorder}`,
                      borderLeft: `4px solid ${theme.accentColor}`,
                      marginBottom: "20px",
                    }}
                  >
                    <Text
                      style={{
                        margin: "0 0 2px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: theme.accentColor,
                      }}
                    >
                      DELIVERY SHIPPING ADDRESS
                    </Text>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#1d1d1f",
                        lineHeight: "1.4",
                      }}
                    >
                      {shipping?.addressLine ? (
                        <>
                          {shipping.addressLine}
                          {shipping.city ? `, ${shipping.city}` : ""}
                          {shipping.state ? `, ${shipping.state}` : ""}
                          {shipping.pincode ? ` - ${shipping.pincode}` : ""}
                        </>
                      ) : (
                        "Shipping address confirmed during checkout. Track order below for live courier updates."
                      )}
                    </Text>
                    <Text
                      style={{
                        margin: "6px 0 0",
                        fontSize: "11px",
                        color: "#6e6e73",
                      }}
                    >
                      📦 Live courier AWB tracking will be sent to your WhatsApp once dispatched from our dock.
                    </Text>
                  </div>
                </>
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "50%", verticalAlign: "top", paddingRight: "12px" }}>
                          <Text
                            style={{
                              margin: "0 0 4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#86868b",
                            }}
                          >
                            SCHEDULE &amp; TIME
                          </Text>
                          <Text
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1d1d1f",
                              lineHeight: "1.35",
                            }}
                          >
                            {dateFormatted}
                          </Text>
                          <Text
                            style={{
                              margin: "2px 0 0",
                              fontSize: "13px",
                              color: "#6e6e73",
                            }}
                          >
                            Reporting: {timeFormatted}
                          </Text>
                        </td>

                        <td style={{ width: "50%", verticalAlign: "top", paddingLeft: "12px" }}>
                          <Text
                            style={{
                              margin: "0 0 4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#86868b",
                            }}
                          >
                            GUEST ADMISSION
                          </Text>
                          <Text
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1d1d1f",
                              lineHeight: "1.35",
                            }}
                          >
                            {customerName}
                          </Text>
                          <Text
                            style={{
                              margin: "2px 0 0",
                              fontSize: "13px",
                              color: "#6e6e73",
                            }}
                          >
                            {seatsCount} Reserved {seatsCount === 1 ? "Seat" : "Seats"}
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Rendezvous Point with Category Theming */}
                  {meetingAddress && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        backgroundColor: "#ffffff",
                        border: `1px solid ${theme.cardBorder}`,
                        borderLeft: `4px solid ${theme.accentColor}`,
                        marginBottom: "20px",
                      }}
                    >
                      <Text
                        style={{
                          margin: "0 0 2px",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: theme.accentColor,
                        }}
                      >
                        RENDEZVOUS &amp; GPS MEETING PIN
                      </Text>
                      <Text
                        style={{
                          margin: "0 0 6px",
                          fontSize: "13px",
                          color: "#1d1d1f",
                          lineHeight: "1.4",
                        }}
                      >
                        {meetingAddress}
                      </Text>
                      {mapsUrl && (
                        <Link
                          href={mapsUrl}
                          style={{
                            fontSize: "12px",
                            color: theme.pinLinkColor,
                            textDecoration: "none",
                            fontWeight: "600",
                          }}
                        >
                          📍 Open Meeting Point in Google Maps →
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Delivery Address (Physical Products in Mixed Orders) */}
                  {shipping && shipping.addressLine && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        backgroundColor: "#ffffff",
                        border: `1px solid ${theme.cardBorder}`,
                        borderLeft: `4px solid ${theme.accentColor}`,
                        marginBottom: "20px",
                      }}
                    >
                      <Text
                        style={{
                          margin: "0 0 2px",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: theme.accentColor,
                        }}
                      >
                        DELIVERY ADDRESS
                      </Text>
                      <Text
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#1d1d1f",
                        }}
                      >
                        {shipping.addressLine}
                        {shipping.city ? `, ${shipping.city}` : ""}
                        {shipping.state ? `, ${shipping.state}` : ""}
                        {shipping.pincode ? ` - ${shipping.pincode}` : ""}
                      </Text>
                    </div>
                  )}

                  {/* Multi-Ticket Attendee Roster (Clean Category Cards) */}
                  {passTickets.length > 1 && (
                    <div style={{ marginBottom: "20px" }}>
                      <Text
                        style={{
                          margin: "0 0 8px",
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: theme.accentColor,
                        }}
                      >
                        {`ADMISSION PASS ROSTER (${passTickets.length} TICKETS)`}
                      </Text>
                      <div>
                        {passTickets.map((t) => (
                          <div
                            key={t.ticketNumber}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "10px",
                              backgroundColor: "#ffffff",
                              border: `1px solid ${theme.cardBorder}`,
                              borderLeft: `3px solid ${theme.accentColor}`,
                              marginBottom: "8px",
                            }}
                          >
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#1d1d1f" }}>
                              {`TICKET #${t.ticketNumber} · ${t.title}`}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6e6e73", marginTop: "2px" }}>
                              {`Guest: ${t.attendeeName}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Primary Boarding Pass or Order Tracking CTA */}
              <div style={{ textAlign: "center", paddingTop: "6px" }}>
                <Button
                  href={passUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: theme.ctaBg,
                    color: theme.ctaColor,
                    fontSize: "13px",
                    fontWeight: "700",
                    padding: "13px 32px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {isGoodsOrder
                    ? "📦 Track Your Order & View Tax Invoice"
                    : "🎫 Open Boarding Pass on Mobile"}
                </Button>
              </div>
            </div>
          </Section>

          {/* Clean Apple-Style Receipt & Official Tax Invoice */}
          <Section
            style={{
              padding: "24px 32px 32px",
              backgroundColor: "#ffffff",
              borderTop: "1px solid #f0f0f2",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#86868b",
                }}
              >
                OFFICIAL GST TAX INVOICE &amp; RECEIPT
              </Text>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
              <tbody>
                {itemsList.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f5f5f7" }}>
                    <td style={{ padding: "10px 0", fontSize: "14px", color: "#1d1d1f" }}>
                      {item.title} <span style={{ color: "#86868b" }}>× {item.quantity}</span>
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1d1d1f",
                        textAlign: "right",
                      }}
                    >
                      ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}

                {/* Tax Breakdown Rows */}
                <tr>
                  <td style={{ padding: "6px 0", fontSize: "12px", color: "#86868b" }}>
                    Taxable Value (Subtotal):
                  </td>
                  <td style={{ padding: "6px 0", fontSize: "12px", color: "#6e6e73", textAlign: "right" }}>
                    ₹{taxableValue.toLocaleString("en-IN")}
                  </td>
                </tr>

                {isInterState ? (
                  <tr>
                    <td style={{ padding: "4px 0", fontSize: "12px", color: "#86868b" }}>
                      IGST (18.0%):
                    </td>
                    <td style={{ padding: "4px 0", fontSize: "12px", color: "#6e6e73", textAlign: "right" }}>
                      ₹{igst.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td style={{ padding: "4px 0", fontSize: "12px", color: "#86868b" }}>
                        CGST (9.0%):
                      </td>
                      <td style={{ padding: "4px 0", fontSize: "12px", color: "#6e6e73", textAlign: "right" }}>
                        ₹{cgst.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "4px 0", fontSize: "12px", color: "#86868b" }}>
                        SGST (9.0%):
                      </td>
                      <td style={{ padding: "4px 0", fontSize: "12px", color: "#6e6e73", textAlign: "right" }}>
                        ₹{sgst.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <td style={{ padding: "4px 0 10px", fontSize: "12px", color: "#86868b" }}>
                    Total GST (18.0%):
                  </td>
                  <td style={{ padding: "4px 0 10px", fontSize: "12px", color: "#6e6e73", textAlign: "right" }}>
                    ₹{totalGst.toLocaleString("en-IN")}
                  </td>
                </tr>

                {/* Total Net Paid */}
                <tr style={{ borderTop: "2px solid #1d1d1f" }}>
                  <td style={{ padding: "12px 0 4px", fontSize: "15px", fontWeight: "700", color: "#1d1d1f" }}>
                    Total Amount Paid
                  </td>
                  <td
                    style={{
                      padding: "12px 0 4px",
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#1d1d1f",
                      textAlign: "right",
                    }}
                  >
                    ₹{totalAmountInr.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Official Tax Invoice Action Button */}
            <div style={{ textAlign: "center", margin: "16px 0 12px" }}>
              <Button
                href={invoiceUrl}
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: "999px",
                  border: "1px solid #d2d2d7",
                  backgroundColor: "#ffffff",
                  color: "#1d1d1f",
                  fontSize: "12px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                📄 View &amp; Print Official Tax Invoice (PDF)
              </Button>
            </div>

            {/* Official Legal Entity & GSTIN Snippet */}
            <div
              style={{
                paddingTop: "12px",
                borderTop: "1px dashed #e5e5ea",
                fontSize: "11px",
                color: "#86868b",
                lineHeight: "1.5",
                textAlign: "center",
              }}
            >
              <b>Kolibaba Seafood Inc.</b> · 101, Samudra Darshan, Budha Lane 2, Versova, Andheri West, Mumbai – 400061
              <br />
              <b>GSTIN:</b> {gstin} (State Code 27) · <b>Invoice No:</b> {invoiceNumber}
            </div>
          </Section>

          {/* Minimalist Apple Footer */}
          <Section
            style={{
              padding: "24px 32px 32px",
              backgroundColor: "#fbfbfd",
              borderTop: "1px solid #f0f0f2",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                margin: "0 0 6px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#6e6e73",
              }}
            >
              In strategic partnership with Bhoomiputra Foundation
            </Text>
            <Text
              style={{
                margin: "0 0 10px",
                fontSize: "11px",
                color: "#86868b",
              }}
            >
              Dispatched from hello@matsyamart.com · Support: +91 76665 11511
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: "10px",
                color: "#a1a1a6",
              }}
            >
              You received this confirmation because you completed a booking on MatsyaMart.
            </Text>
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
      "Versova Gaothan Dining Courtyard, Andheri West, Mumbai – 400061",
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

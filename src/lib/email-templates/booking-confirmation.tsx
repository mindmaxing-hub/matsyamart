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
  ctaBg: string;
  ctaColor: string;
}

// Apple design system theme accents: light canvas with category-true accents
const THEMES: Record<EmailCategory, ThemePalette> = {
  food: {
    badgeBg: "#fffbeb",
    badgeBorder: "1px solid #fde047",
    badgeColor: "#1c3554",
    badgeText: "🐟 Confirmed Coastal Food Feast & Tax Invoice",
    accentColor: "#1c3554", // Midnight Navy
    ctaBg: "#1c3554",
    ctaColor: "#ffffff",
  },
  walk: {
    badgeBg: "#f0fdfa",
    badgeBorder: "1px solid #99f6e4",
    badgeColor: "#5f98a0",
    badgeText: "🌊 Confirmed Coastal Heritage Walk & Tax Invoice",
    accentColor: "#5f98a0", // Seafoam Teal
    ctaBg: "#111827",
    ctaColor: "#ffffff",
  },
  workshop: {
    badgeBg: "#fff7ed",
    badgeBorder: "1px solid #fed7aa",
    badgeColor: "#2b120c",
    badgeText: "🪵 Confirmed Coastal Craft Workshop & Tax Invoice",
    accentColor: "#2b120c", // Espresso Terracotta
    ctaBg: "#2b120c",
    ctaColor: "#ffffff",
  },
  goods: {
    badgeBg: "#ecfdf5",
    badgeBorder: "1px solid #a7f3d0",
    badgeColor: "#10b981",
    badgeText: "📦 Confirmed Artisanal Coastal Goods & Tax Invoice",
    accentColor: "#10b981", // Emerald
    ctaBg: "#111827",
    ctaColor: "#ffffff",
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
    "Versova Gaothan Dining Courtyard, Andheri West, Mumbai – 400061";

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

  const category = resolveEmailCategory(props?.pillar, experienceTitle, orderRef);
  const theme = THEMES[category];

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
        Pass &amp; Tax Invoice for {experienceTitle} ({orderRef})
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
          {/* Minimalist Apple Brand Header */}
          <Section
            style={{
              padding: "28px 32px 18px",
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
                        color: "#86868b",
                      }}
                    >
                      MATSYAMART · OFFICIAL PASS
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
                  padding: "4px 12px",
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
              Reserved for <b>{customerName}</b> ({customerEmail})
            </Text>
          </Section>

          {/* Apple Wallet-Style Boarding Pass Card */}
          <Section style={{ padding: "0 32px 28px" }}>
            <div
              style={{
                backgroundColor: "#fbfbfd",
                borderRadius: "16px",
                border: "1px solid #e5e5ea",
                padding: "24px",
              }}
            >
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

              {/* Rendezvous Point */}
              {meetingAddress && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5ea",
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
                      color: "#86868b",
                    }}
                  >
                    RENDEZVOUS &amp; GPS MEETING PIN
                  </Text>
                  <Text
                    style={{
                      margin: "0 0 4px",
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
                        color: "#0066cc",
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                    >
                      📍 Open Meeting Point in Google Maps →
                    </Link>
                  )}
                </div>
              )}

              {/* Delivery Address (Physical Products) */}
              {shipping && shipping.addressLine && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5ea",
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
                      color: "#86868b",
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
                    {shipping.pincode ? ` – ${shipping.pincode}` : ""}
                  </Text>
                </div>
              )}

              {/* Multi-Ticket Attendee Roster (Clean Compact Grid) */}
              {passTickets.length > 1 && (
                <div style={{ marginBottom: "20px" }}>
                  <Text
                    style={{
                      margin: "0 0 8px",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#86868b",
                    }}
                  >
                    {`ADMISSION PASS ROSTER (${passTickets.length} TICKETS)`}
                  </Text>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {passTickets.map((t) => (
                        <tr
                          key={t.ticketNumber}
                          style={{
                            borderBottom: "1px solid #f0f0f2",
                          }}
                        >
                          <td style={{ padding: "8px 0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#1d1d1f" }}>
                              {`TICKET #${t.ticketNumber} · ${t.title}`}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6e6e73", marginTop: "2px" }}>
                              {`Guest: ${t.attendeeName}`}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Primary Boarding Pass CTA (Apple Pill Button) */}
              <div style={{ textAlign: "center", paddingTop: "4px" }}>
                <Button
                  href={passUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: theme.ctaBg,
                    color: theme.ctaColor,
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "12px 28px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  🎫 Open Boarding Pass on Mobile
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

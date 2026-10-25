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
  const mapsUrl =
    props?.mapsUrl || "https://maps.app.goo.gl/TfKpsZPCyisNzSXv6";
  const passUrl =
    props?.passUrl ||
    `https://matsyamart.com/order/confirmation/${orderRef}`;
  const invoiceUrl =
    props?.invoiceUrl ||
    `https://matsyamart.com/order/confirmation/${orderRef}?view=invoice`;
  const invoiceNumber = props?.invoiceNumber || `INV-${orderRef}`;
  const gstin = props?.gstin || "27AAACK1234F1Z5";

  // 18% GST Calculations (inclusive)
  const taxableValue =
    props?.taxableValueInr ??
    Math.round((totalAmountInr / 1.18) * 100) / 100;
  const totalGst =
    props?.gstAmountInr ??
    Math.round((totalAmountInr - taxableValue) * 100) / 100;
  const cgst = props?.cgstInr ?? Math.round((totalGst / 2) * 100) / 100;
  const sgst = props?.sgstInr ?? Math.round((totalGst - cgst) * 100) / 100;

  const itemsList = props?.items && props.items.length > 0
    ? props.items
    : [
        {
          title: experienceTitle,
          quantity: seatsCount,
          unitPrice: Math.round(totalAmountInr / Math.max(1, seatsCount)),
          pillar: props?.pillar || "food",
        },
      ];

  const shipping = props?.shippingAddress;

  return (
    <Html>
      <Head />
      <Preview>
        Pass &amp; GST Tax Invoice for {experienceTitle} ({orderRef})
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Card Wrapper */}
          <Section style={cardStyle}>
            {/* Header */}
            <Section style={headerStyle}>
              <Text style={badgeStyle}>🐟 Confirmed Coastal Pass &amp; Tax Invoice</Text>
              <Heading as="h1" style={titleStyle}>
                {experienceTitle}
              </Heading>
              <Text style={refStyle}>PASS REF: {orderRef}</Text>
            </Section>

            {/* Content Details */}
            <Section style={contentStyle}>
              {/* Guest & Attendance */}
              <Text style={sectionTitleStyle}>GUEST &amp; ATTENDANCE</Text>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Guest Name:</Text>
                <Text style={valueStyle}>
                  <b>{customerName}</b>
                </Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Registered Email:</Text>
                <Text style={valueStyle}>
                  <b>{customerEmail}</b>
                </Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Reserved Seats:</Text>
                <Text style={valueStyle}>{seatsCount} Guest(s)</Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Scheduled Date:</Text>
                <Text style={valueStyle}>
                  <b>{dateFormatted}</b>
                </Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Reporting Time:</Text>
                <Text style={valueStyle}>
                  <b>{timeFormatted}</b>
                </Text>
              </Section>

              {/* Physical Delivery Address (if present) */}
              {shipping && shipping.addressLine && (
                <>
                  <Hr style={dividerStyle} />
                  <Text style={sectionTitleStyle}>DELIVERY SHIPPING ADDRESS</Text>
                  <Text style={venueTextStyle}>
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
                  <Hr style={dividerStyle} />
                  <Text style={sectionTitleStyle}>RENDEZVOUS &amp; GPS MEETING PIN</Text>
                  <Text style={venueTextStyle}>{meetingAddress}</Text>

                  {mapsUrl && (
                    <Section style={{ textAlign: "center", margin: "14px 0 20px" }}>
                      <Button href={mapsUrl} style={mapsBtnStyle}>
                        📍 Open Meeting Point in Google Maps
                      </Button>
                    </Section>
                  )}
                </>
              )}

              <Hr style={dividerStyle} />

              {/* Mobile Boarding Pass CTA */}
              <Section style={passBoxStyle}>
                <Text style={passBoxHeadingStyle}>📲 Digital Boarding Pass Ready</Text>
                <Text style={passBoxSubStyle}>
                  Tap below to open your secure QR boarding pass on any mobile browser. Keep it handy at the check-in gate.
                </Text>
                <Button href={passUrl} style={passBtnStyle}>
                  🎫 Open Boarding Pass on Mobile
                </Button>
                <Text style={linkFallbackStyle}>
                  Direct mobile link:{" "}
                  <Link href={passUrl} style={inlineLinkStyle}>
                    {passUrl}
                  </Link>
                </Text>
              </Section>

              <Hr style={dividerStyle} />

              {/* Official GST Tax Invoice Card */}
              <Text style={sectionTitleStyle}>OFFICIAL GST TAX INVOICE &amp; RECEIPT</Text>
              <Section style={invoiceCardStyle}>
                {/* Invoice Meta */}
                <Section style={{ marginBottom: "14px" }}>
                  <Text style={invoiceSupplierStyle}>
                    <b>Kolibaba Seafood Inc</b>
                    <br />
                    In strategic partnership with <b>Bhoomiputra Foundation</b>
                    <br />
                    Versova Jetty No. 1, Gaothan, Andheri West, Mumbai – 400061
                    <br />
                    <b>GSTIN:</b> {gstin} (State Code: 27 · Maharashtra)
                  </Text>
                </Section>

                <Section style={invoiceMetaRowStyle}>
                  <Text style={invoiceMetaTextStyle}>
                    <b>Invoice No:</b> {invoiceNumber}
                  </Text>
                  <Text style={invoiceMetaTextStyle}>
                    <b>Order Ref:</b> {orderRef}
                  </Text>
                  <Text style={invoiceMetaTextStyle}>
                    <b>Payment:</b> ONLINE (RAZORPAY) · PAID
                  </Text>
                </Section>

                <Hr style={invoiceDividerStyle} />

                {/* Itemized Table */}
                <Section style={{ margin: "12px 0" }}>
                  <Text style={invoiceTableHeadingStyle}>ITEMIZED BREAKDOWN</Text>
                  {itemsList.map((item, idx) => (
                    <Section key={idx} style={itemRowStyle}>
                      <Text style={itemNameStyle}>
                        {item.title} (x{item.quantity})
                      </Text>
                      <Text style={itemPriceStyle}>
                        ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </Text>
                    </Section>
                  ))}
                </Section>

                <Hr style={invoiceDividerStyle} />

                {/* Tax Breakdown */}
                <Section style={taxRowStyle}>
                  <Text style={taxLabelStyle}>Taxable Value (Subtotal):</Text>
                  <Text style={taxValueStyle}>₹{taxableValue.toFixed(2)}</Text>
                </Section>
                <Section style={taxRowStyle}>
                  <Text style={taxLabelStyle}>CGST (9.0%):</Text>
                  <Text style={taxValueStyle}>₹{cgst.toFixed(2)}</Text>
                </Section>
                <Section style={taxRowStyle}>
                  <Text style={taxLabelStyle}>SGST (9.0%):</Text>
                  <Text style={taxValueStyle}>₹{sgst.toFixed(2)}</Text>
                </Section>
                <Section style={taxRowStyle}>
                  <Text style={taxLabelStyle}>Total GST (18.0%):</Text>
                  <Text style={taxValueStyle}>₹{totalGst.toFixed(2)}</Text>
                </Section>
                <Section style={totalRowStyle}>
                  <Text style={totalLabelStyle}>NET AMOUNT PAID:</Text>
                  <Text style={totalValueStyle}>
                    ₹{totalAmountInr.toLocaleString("en-IN")}
                  </Text>
                </Section>

                {/* Invoice Button CTA */}
                <Section style={{ textAlign: "center", marginTop: "20px" }}>
                  <Button href={invoiceUrl} style={invoiceBtnStyle}>
                    🧾 View &amp; Print Official Tax Invoice (PDF)
                  </Button>
                  <Text style={linkFallbackStyle}>
                    Direct invoice link:{" "}
                    <Link href={invoiceUrl} style={inlineLinkStyle}>
                      {invoiceUrl}
                    </Link>
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={footerStyle}>
              <Text style={footerTextStyle}>
                Dispatched from <b>hello@matsyamart.com</b> via notify.matsyamart.com
              </Text>
              <Text style={footerSubTextStyle}>
                Kolibaba Seafood Inc · In partnership with Bhoomiputra Foundation
              </Text>
              <Text style={footerSubTextStyle}>
                Versova Jetty No. 1, Gaothan, Andheri West, Mumbai, Maharashtra 400061
              </Text>
              <Text style={footerSubTextStyle}>
                Support: hello@matsyamart.com · +91 76665 11511 / +91 99204 77158
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styling definitions (Dark Roast editorial theme with high contrast invoice paper)
const mainStyle = {
  backgroundColor: "#140604",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "32px 16px",
};

const containerStyle = {
  maxWidth: "580px",
  margin: "0 auto",
};

const cardStyle = {
  backgroundColor: "#1f0b07",
  border: "1px solid rgba(218, 179, 140, 0.25)",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
};

const headerStyle = {
  padding: "32px 24px 24px",
  textAlign: "center" as const,
  backgroundColor: "#29100b",
  borderBottom: "1px dashed rgba(218, 179, 140, 0.25)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "4px 12px",
  backgroundColor: "#35160e",
  border: "1px solid rgba(227, 161, 87, 0.4)",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "700",
  color: "#e3a157",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 12px",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#f5edeb",
  margin: "0 0 8px",
  lineHeight: "1.25",
};

const refStyle = {
  fontFamily: "monospace",
  fontSize: "13px",
  color: "#dab38c",
  letterSpacing: "0.1em",
  margin: "0",
};

const contentStyle = {
  padding: "24px 28px",
};

const sectionTitleStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#e3a157",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 12px",
};

const gridRowStyle = {
  marginBottom: "8px",
};

const labelStyle = {
  fontSize: "12px",
  color: "#dab38c",
  margin: "0 0 2px",
};

const valueStyle = {
  fontSize: "14px",
  color: "#f5edeb",
  margin: "0 0 8px",
};

const dividerStyle = {
  borderTop: "1px solid rgba(218, 179, 140, 0.15)",
  margin: "20px 0",
};

const venueTextStyle = {
  fontSize: "13px",
  color: "#f5edeb",
  backgroundColor: "#29100b",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(218, 179, 140, 0.2)",
  margin: "0",
  lineHeight: "1.5",
};

const mapsBtnStyle = {
  backgroundColor: "#35160e",
  color: "#dab38c",
  border: "1px solid rgba(218, 179, 140, 0.3)",
  fontWeight: "600",
  fontSize: "12px",
  padding: "10px 20px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
};

const passBoxStyle = {
  backgroundColor: "#29100b",
  borderRadius: "16px",
  padding: "20px",
  textAlign: "center" as const,
  border: "1px solid rgba(227, 161, 87, 0.3)",
};

const passBoxHeadingStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#e3a157",
  margin: "0 0 6px",
};

const passBoxSubStyle = {
  fontSize: "12px",
  color: "#dab38c",
  margin: "0 0 16px",
  lineHeight: "1.4",
};

const passBtnStyle = {
  backgroundColor: "#e3a157",
  color: "#1f0b07",
  fontWeight: "700",
  fontSize: "13px",
  padding: "12px 24px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
};

const linkFallbackStyle = {
  fontSize: "11px",
  color: "rgba(218, 179, 140, 0.7)",
  marginTop: "10px",
  marginBottom: "0",
  wordBreak: "break-all" as const,
};

const inlineLinkStyle = {
  color: "#e3a157",
  textDecoration: "underline",
};

const invoiceCardStyle = {
  backgroundColor: "#240e09",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid rgba(218, 179, 140, 0.2)",
};

const invoiceSupplierStyle = {
  fontSize: "11px",
  color: "#dab38c",
  lineHeight: "1.6",
  margin: "0",
};

const invoiceMetaRowStyle = {
  backgroundColor: "#1f0b07",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(218, 179, 140, 0.15)",
};

const invoiceMetaTextStyle = {
  fontSize: "11px",
  color: "#f5edeb",
  margin: "2px 0",
  fontFamily: "monospace",
};

const invoiceDividerStyle = {
  borderTop: "1px dashed rgba(218, 179, 140, 0.2)",
  margin: "14px 0",
};

const invoiceTableHeadingStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#e3a157",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};

const itemRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "6px",
};

const itemNameStyle = {
  fontSize: "12px",
  color: "#f5edeb",
  margin: "0",
};

const itemPriceStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#dab38c",
  margin: "0",
  fontFamily: "monospace",
};

const taxRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "4px",
};

const taxLabelStyle = {
  fontSize: "11px",
  color: "#dab38c",
  margin: "0",
};

const taxValueStyle = {
  fontSize: "11px",
  color: "#f5edeb",
  margin: "0",
  fontFamily: "monospace",
};

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
  paddingTop: "10px",
  borderTop: "1px solid rgba(218, 179, 140, 0.3)",
};

const totalLabelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#e3a157",
  margin: "0",
};

const totalValueStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#e3a157",
  margin: "0",
  fontFamily: "monospace",
};

const invoiceBtnStyle = {
  backgroundColor: "#35160e",
  color: "#dab38c",
  border: "1px solid rgba(227, 161, 87, 0.4)",
  fontWeight: "700",
  fontSize: "12px",
  padding: "11px 22px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
};

const footerStyle = {
  padding: "20px 24px",
  textAlign: "center" as const,
  backgroundColor: "#140604",
  borderTop: "1px solid rgba(218, 179, 140, 0.15)",
};

const footerTextStyle = {
  fontSize: "11px",
  color: "#dab38c",
  margin: "0 0 4px",
};

const footerSubTextStyle = {
  fontSize: "10px",
  color: "rgba(218, 179, 140, 0.6)",
  margin: "0 0 2px",
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
    gstin: "27AAACK1234F1Z5",
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

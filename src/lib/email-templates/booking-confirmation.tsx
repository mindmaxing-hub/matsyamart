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

export interface BookingConfirmationEmailProps {
  orderRef?: string;
  customerName?: string;
  experienceTitle?: string;
  pillar?: string;
  seatsCount?: number;
  totalAmountInr?: number;
  dateFormatted?: string;
  timeFormatted?: string;
  meetingAddress?: string;
  mapsUrl?: string;
  passUrl?: string;
}

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
  orderRef = "MM-EXP-2026-0042",
  customerName = "Aryan Panchal",
  experienceTitle = "Versova Coastal Heritage & Seafood Feast",
  pillar = "food",
  seatsCount = 2,
  totalAmountInr = 2900,
  dateFormatted = "Sunday, 12 December 2026",
  timeFormatted = "1:00 PM IST",
  meetingAddress = "Versova Gaothan Dining Courtyard, Andheri West, Mumbai - 400061",
  mapsUrl = "https://maps.app.goo.gl/TfKpsZPCyisNzSXv6",
  passUrl = "https://matsyamart.com/order/confirmation/MM-EXP-2026-0042",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your Boarding Pass for {experienceTitle} ({orderRef})</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Card Wrapper */}
          <Section style={cardStyle}>
            {/* Header */}
            <Section style={headerStyle}>
              <Text style={badgeStyle}>🐟 Confirmed Coastal Pass</Text>
              <Heading as="h1" style={titleStyle}>
                {experienceTitle}
              </Heading>
              <Text style={refStyle}>PASS REF: {orderRef}</Text>
            </Section>

            {/* Content Details */}
            <Section style={contentStyle}>
              <Text style={sectionTitleStyle}>GUEST &amp; ATTENDANCE</Text>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Guest Name:</Text>
                <Text style={valueStyle}><b>{customerName}</b></Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Reserved Seats:</Text>
                <Text style={valueStyle}>{seatsCount} Guest(s)</Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Scheduled Date:</Text>
                <Text style={valueStyle}><b>{dateFormatted}</b></Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Reporting Time:</Text>
                <Text style={valueStyle}><b>{timeFormatted}</b></Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Amount Paid:</Text>
                <Text style={valueStyle}><b>₹{totalAmountInr} (Paid)</b></Text>
              </Section>

              <Hr style={dividerStyle} />

              {/* Rendezvous Point */}
              <Text style={sectionTitleStyle}>RENDEZVOUS &amp; GPS MEETING PIN</Text>
              <Text style={venueTextStyle}>{meetingAddress}</Text>

              {mapsUrl && (
                <Section style={{ textAlign: "center", margin: "16px 0 24px" }}>
                  <Button href={mapsUrl} style={mapsBtnStyle}>
                    📍 Open Meeting Point in Google Maps
                  </Button>
                </Section>
              )}

              <Hr style={dividerStyle} />

              {/* Mobile Boarding Pass CTA */}
              <Section style={passBoxStyle}>
                <Text style={passBoxHeadingStyle}>📲 Digital Boarding Pass Ready</Text>
                <Text style={passBoxSubStyle}>
                  Tap below to open your QR boarding pass on your mobile browser. Save it or present it at the rendezvous gate.
                </Text>
                <Button href={passUrl} style={passBtnStyle}>
                  🎫 Open Boarding Pass on Mobile
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={footerStyle}>
              <Text style={footerTextStyle}>
                Dispatched by <b>hello@matsyamart.com</b> via notify.matsyamart.com
              </Text>
              <Text style={footerSubTextStyle}>
                Kolibaba Seafood Inc · In partnership with Bhoomiputra Foundation
              </Text>
              <Text style={footerSubTextStyle}>
                Preserving indigenous Koli maritime culture and fair coastal revenue.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styling definitions (Dark Roast editorial theme)
const mainStyle = {
  backgroundColor: "#140604",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
  subject: (data) => `Your Boarding Pass · ${String(data?.["orderRef"] || "MatsyaMart")}`,
  displayName: "Booking Confirmation & Digital Pass",
  previewData: {
    orderRef: "MM-EXP-2026-0042",
    customerName: "Aryan Panchal",
    experienceTitle: "Versova Coastal Heritage & Seafood Feast",
    pillar: "food",
    seatsCount: 2,
    totalAmountInr: 2900,
    dateFormatted: "Sunday, 12 December 2026",
    timeFormatted: "1:00 PM IST",
    meetingAddress: "Versova Gaothan Dining Courtyard, Andheri West, Mumbai - 400061",
    mapsUrl: "https://maps.app.goo.gl/TfKpsZPCyisNzSXv6",
    passUrl: "https://matsyamart.com/order/confirmation/MM-EXP-2026-0042",
  },
};

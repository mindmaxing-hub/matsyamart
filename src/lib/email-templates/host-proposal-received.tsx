import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

export interface HostProposalReceivedEmailProps {
  applicantName?: string;
  proposalTitle?: string;
  category?: string;
  phone?: string;
}

export const HostProposalReceivedEmail: React.FC<HostProposalReceivedEmailProps> = ({
  applicantName = "Ramesh Tandel",
  proposalTitle = "Versova Crab Masala Tasting Feast",
  category = "Food",
  phone = "9820099887",
}) => {
  return (
    <Html>
      <Head />
      <Preview>We received your coastal offering proposal: {proposalTitle}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            {/* Header */}
            <Section style={headerStyle}>
              <Text style={badgeStyle}>🐟 Koli Community Partnership</Text>
              <Heading as="h1" style={titleStyle}>
                Proposal Received!
              </Heading>
              <Text style={subTitleStyle}>
                Thank you for sharing your ancestral coastal offering with MatsyaMart.
              </Text>
            </Section>

            {/* Content Details */}
            <Section style={contentStyle}>
              <Text style={greetingStyle}>Namaste {applicantName},</Text>
              <Text style={bodyTextStyle}>
                Your offering proposal has been logged with our community coordination team. We believe that local fishermen, cooks, and artisans deserve full recognition, fair earnings, and direct connection with guests who honor our heritage.
              </Text>

              <Section style={summaryBoxStyle}>
                <Text style={summaryLabelStyle}>OFFERING SUMMARY</Text>
                <Text style={summaryValueStyle}><b>Title:</b> {proposalTitle}</Text>
                <Text style={summaryValueStyle}><b>Category:</b> {category}</Text>
                <Text style={summaryValueStyle}><b>Registered WhatsApp:</b> {phone}</Text>
              </Section>

              <Hr style={dividerStyle} />

              <Text style={stepsHeadingStyle}>What Happens Next?</Text>
              <Text style={bodyTextStyle}>
                1. <b>Coordination Review:</b> Our local village liaison reviews your proposed schedule, rendezvous location, and material requirements.
              </Text>
              <Text style={bodyTextStyle}>
                2. <b>WhatsApp Outreach:</b> Our team will message you directly on WhatsApp ({phone}) within <b>48 hours</b> to confirm your dates, guest slots, and payout agreements.
              </Text>
              <Text style={bodyTextStyle}>
                3. <b>Going Live:</b> Once confirmed, your offering will be published on MatsyaMart, and verified guests will receive official boarding passes to meet you.
              </Text>

              <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
                <Button href="https://matsyamart.com" style={ctaBtnStyle}>
                  Return to MatsyaMart Catalog
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={footerStyle}>
              <Text style={footerTextStyle}>
                Questions? Reach out to our community coordinator at <b>hello@matsyamart.com</b> or call <b>+91 76665 11511</b>.
              </Text>
              <Text style={footerSubTextStyle}>
                Kolibaba Seafood Inc · In partnership with Bhoomiputra Foundation
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

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
  padding: "32px 24px 20px",
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
  fontSize: "24px",
  fontWeight: "700",
  color: "#f5edeb",
  margin: "0 0 8px",
};

const subTitleStyle = {
  fontSize: "13px",
  color: "#dab38c",
  margin: "0",
  lineHeight: "1.4",
};

const contentStyle = {
  padding: "24px 28px",
};

const greetingStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#f5edeb",
  margin: "0 0 12px",
};

const bodyTextStyle = {
  fontSize: "13px",
  color: "#dab38c",
  lineHeight: "1.5",
  margin: "0 0 12px",
};

const summaryBoxStyle = {
  backgroundColor: "#29100b",
  border: "1px solid rgba(218, 179, 140, 0.2)",
  borderRadius: "16px",
  padding: "16px 20px",
  margin: "16px 0",
};

const summaryLabelStyle = {
  fontSize: "10.5px",
  fontWeight: "700",
  color: "#e3a157",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 8px",
};

const summaryValueStyle = {
  fontSize: "13px",
  color: "#f5edeb",
  margin: "0 0 4px",
};

const dividerStyle = {
  borderTop: "1px solid rgba(218, 179, 140, 0.15)",
  margin: "20px 0",
};

const stepsHeadingStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#e3a157",
  margin: "0 0 10px",
};

const ctaBtnStyle = {
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
  margin: "0",
};

export const template: TemplateEntry = {
  component: HostProposalReceivedEmail,
  subject: (data) => `Proposal Received: ${String(data?.["proposalTitle"] || "MatsyaMart Community Offering")}`,
  displayName: "Host Proposal Acknowledgment",
  previewData: {
    applicantName: "Ramesh Tandel",
    proposalTitle: "Versova Crab Masala Tasting Feast",
    category: "Food",
    phone: "9820099887",
  },
};

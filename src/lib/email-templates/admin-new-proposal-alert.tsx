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

export interface AdminNewProposalAlertEmailProps {
  applicantName?: string;
  phone?: string;
  email?: string;
  category?: string;
  proposalTitle?: string;
  summary?: string;
  submittedAt?: string;
}

export const AdminNewProposalAlertEmail: React.FC<AdminNewProposalAlertEmailProps> = ({
  applicantName = "Ramesh Tandel",
  phone = "9820099887",
  email = "ramesh.tandel@example.com",
  category = "Food",
  proposalTitle = "Versova Crab Masala Tasting Feast",
  summary = "Freshly cooked mangrove crab in earthen pots with bhakri. Price ₹1,500.",
  submittedAt = "Just now",
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Community Proposal: {applicantName} ({category})</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            {/* Header */}
            <Section style={headerStyle}>
              <Text style={badgeStyle}>🚨 Admin Review Alert</Text>
              <Heading as="h1" style={titleStyle}>
                New Community Proposal
              </Heading>
              <Text style={subTitleStyle}>
                A local custodian has submitted an offering for community review.
              </Text>
            </Section>

            {/* Content Details */}
            <Section style={contentStyle}>
              <Text style={sectionTitleStyle}>APPLICANT CONTACT</Text>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Applicant Name:</Text>
                <Text style={valueStyle}><b>{applicantName}</b></Text>
              </Section>
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>WhatsApp Phone:</Text>
                <Text style={valueStyle}><b>{phone}</b></Text>
              </Section>
              {email && (
                <Section style={gridRowStyle}>
                  <Text style={labelStyle}>Email Address:</Text>
                  <Text style={valueStyle}>{email}</Text>
                </Section>
              )}
              <Section style={gridRowStyle}>
                <Text style={labelStyle}>Submitted At:</Text>
                <Text style={valueStyle}>{submittedAt}</Text>
              </Section>

              <Hr style={dividerStyle} />

              <Text style={sectionTitleStyle}>PROPOSAL SPECIFICATIONS</Text>
              <Section style={summaryBoxStyle}>
                <Text style={summaryLabelStyle}>OFFERING DETAILS</Text>
                <Text style={summaryValueStyle}><b>Title:</b> {proposalTitle}</Text>
                <Text style={summaryValueStyle}><b>Category:</b> {category}</Text>
                <Text style={summaryValueStyle}><b>Summary &amp; Notes:</b> {summary}</Text>
              </Section>

              <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
                <Button
                  href="https://matsyamart.com/admin"
                  style={ctaBtnStyle}
                >
                  Open Admin Review Queue →
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={footerStyle}>
              <Text style={footerTextStyle}>
                MatsyaMart Operations Desk · Dispatched to <b>hello@matsyamart.com</b>
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
  fontSize: "22px",
  fontWeight: "700",
  color: "#f5edeb",
  margin: "0 0 6px",
};

const subTitleStyle = {
  fontSize: "13px",
  color: "#dab38c",
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
  fontSize: "13.5px",
  color: "#f5edeb",
  margin: "0 0 8px",
};

const dividerStyle = {
  borderTop: "1px solid rgba(218, 179, 140, 0.15)",
  margin: "20px 0",
};

const summaryBoxStyle = {
  backgroundColor: "#29100b",
  border: "1px solid rgba(218, 179, 140, 0.2)",
  borderRadius: "16px",
  padding: "16px 20px",
  margin: "12px 0",
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
  margin: "0 0 6px",
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
  padding: "18px 24px",
  textAlign: "center" as const,
  backgroundColor: "#140604",
  borderTop: "1px solid rgba(218, 179, 140, 0.15)",
};

const footerTextStyle = {
  fontSize: "11px",
  color: "#dab38c",
  margin: "0",
};

export const template: TemplateEntry = {
  component: AdminNewProposalAlertEmail,
  subject: (data) =>
    `New Community Host Proposal: ${String(data?.["applicantName"] || "New Applicant")} (${String(data?.["category"] || "Offering")})`,
  displayName: "Admin Proposal Review Alert",
  to: "hello@matsyamart.com",
  previewData: {
    applicantName: "Ramesh Tandel",
    phone: "9820099887",
    email: "ramesh.tandel@example.com",
    category: "Food",
    proposalTitle: "Versova Crab Masala Tasting Feast",
    summary: "Freshly cooked mangrove crab in earthen pots with bhakri. Price ₹1,500.",
    submittedAt: "25 Oct 2026, 4:25 PM IST",
  },
};

/**
 * Bhoomiputra Foundation Membership Theft Prevention & Security Engine
 * Protects 15% Member Privileges via Phone-Bound Verification & WhatsApp Delegation OTP
 * Official Sender: +91 76665 11511
 */

import { supabase } from "./supabase";
import {
  FAST2SMS_SENDER_PHONE_ID,
  FAST2SMS_SENDER_DISPLAY,
  sendFast2SMSWhatsApp,
} from "./fast2smsWhatsApp";

export interface BhoomiputraMemberRecord {
  id: string; // Canonical e.g. "BH-MMR-075"
  name: string;
  phones: string[]; // 10-digit clean strings
  tier: string;
  settlement: string;
  status: "active" | "inactive";
  /** Set by the secure database check: true when the checkout phone matches the member's own number */
  phoneVerified?: boolean;
}

// Official seed registry for core Foundation cards
export const CORE_BHOOMIPUTRA_REGISTRY: BhoomiputraMemberRecord[] = [
  {
    id: "BH-MMR-075",
    name: "Aryan Panchal",
    phones: ["7304290690", "7666511511"],
    tier: "Active Member",
    settlement: "Versova Koliwada",
    status: "active",
  },
  {
    id: "BH-MMR-061",
    name: "Ashwini Koli",
    phones: ["9920477158"],
    tier: "Active Member",
    settlement: "Versova Koliwada",
    status: "active",
  },
  {
    id: "BH-MMR-062",
    name: "Anusaya Tai Koli",
    phones: ["9820144512"],
    tier: "Active Member",
    settlement: "Sassoon Docks",
    status: "active",
  },
  {
    id: "BH-MMR-001",
    name: "Suresh Nakawa",
    phones: ["9820144001"],
    tier: "Founding Member",
    settlement: "Mahim Koliwada",
    status: "active",
  },
];

export interface DelegationSession {
  memberId: string;
  memberName: string;
  memberPhone: string;
  requesterPhone: string;
  code: string;
  expiresAt: number;
  verified: boolean;
  delegationToken?: string;
  createdAt: number;
}

// In-memory sliding-window store for delegation requests: key = `${memberId}_${requesterPhone}`
const delegationSessions = new Map<string, DelegationSession>();
// Store verified tokens: key = delegationToken -> DelegationSession
const verifiedTokens = new Map<string, DelegationSession>();

const DELEGATION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 45 * 1000; // 45 seconds

/**
 * Normalizes phone number into 10-digit Indian standard
 */
export function clean10DigitPhone(raw?: string | null): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Masks phone number for public UI feedback (e.g. "+91 ••••••9069")
 */
export function maskPhone(phone?: string | null): string {
  const digits = clean10DigitPhone(phone);
  if (!digits || digits.length < 4) return "+91 ••••••••••";
  return `+91 ••••••${digits.slice(-4)}`;
}

/**
 * Looks up a member across Supabase and the core registry by Member ID or Phone
 */
export async function findBhoomiputraMember(query: {
  memberId?: string;
  phone?: string;
}): Promise<BhoomiputraMemberRecord | null> {
  const cleanId = (query.memberId || "").trim().toUpperCase();
  const cleanPhone = clean10DigitPhone(query.phone);

  // 1. Core Seed Registry fast memory match (instant, offline resilient)
  for (const record of CORE_BHOOMIPUTRA_REGISTRY) {
    if (cleanId && record.id.toUpperCase() === cleanId) {
      return record;
    }
    if (cleanPhone && record.phones.includes(cleanPhone)) {
      return record;
    }
  }

  // Normalized sequence ID match (e.g. "BH-MMR-75" or "75" -> "BH-MMR-075")
  if (cleanId) {
    const digits = cleanId.replace(/\D/g, "");
    if (digits.length < 10 && digits.length > 0) {
      const seq = parseInt(digits, 10);
      const canonical = `BH-MMR-${String(seq).padStart(3, "0")}`;
      const found = CORE_BHOOMIPUTRA_REGISTRY.find(
        (r) => r.id.toUpperCase() === canonical,
      );
      if (found) return found;
    }
  }

  // 2. Secure masked lookup via the verify_bhoomiputra_member function only.
  // Never read member tables directly and never accept unregistered IDs.
  if (supabase && cleanId) {
    try {
      const { data, error } = await supabase.rpc("verify_bhoomiputra_member", {
        p_member_id: cleanId,
        p_phone: cleanPhone || null,
      });
      const rpc = data as
        | { valid?: boolean; member_id?: string; masked_name?: string; region?: string; phone_match?: boolean }
        | null;
      if (!error && rpc?.valid) {
        return {
          id: rpc.member_id || cleanId,
          name: rpc.masked_name || "Verified Bhoomiputra Member",
          phones: [],
          phoneVerified: rpc.phone_match === true,
          tier: "Verified Member",
          settlement: rpc.region || "Coastal Collective",
          status: "active",
        };
      }
    } catch (err) {
      console.warn("[Bhoomiputra Security] member lookup failed:", err);
    }
  }

  return null;
}

/**
 * Dispatches a 4-digit Delegation Authorization Code to the registered member's WhatsApp
 */
export async function sendDelegationOtp(params: {
  memberId: string;
  requesterPhone: string;
}): Promise<{
  success: boolean;
  maskedPhone?: string | undefined;
  cooldownRemaining?: number | undefined;
  error?: string | undefined;
  waLink?: string | undefined;
}> {
  const member = await findBhoomiputraMember({ memberId: params.memberId });
  if (!member) {
    return {
      success: false,
      error: `Member ID "${params.memberId}" was not found in the Bhoomiputra Foundation registry.`,
    };
  }

  const primaryPhone = member.phones[0];
  if (!primaryPhone) {
    return {
      success: false,
      error: `Member "${member.name}" has no registered WhatsApp mobile number on file.`,
    };
  }

  const cleanRequester = clean10DigitPhone(params.requesterPhone);
  const sessionKey = `${member.id.toUpperCase()}_${cleanRequester}`;
  const now = Date.now();
  const existing = delegationSessions.get(sessionKey);

  if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
    return {
      success: false,
      cooldownRemaining: remaining,
      error: `Please wait ${remaining} seconds before requesting a new authorization code.`,
    };
  }

  // 4-digit cryptographically random delegation code
  const code = (1000 + (crypto.getRandomValues(new Uint32Array(1))[0]! % 9000)).toString();

  const session: DelegationSession = {
    memberId: member.id,
    memberName: member.name,
    memberPhone: primaryPhone,
    requesterPhone: cleanRequester,
    code,
    expiresAt: now + DELEGATION_EXPIRY_MS,
    verified: false,
    createdAt: now,
  };

  delegationSessions.set(sessionKey, session);

  // Build WhatsApp Alert Message for the registered member
  const alertText =
    `🐟 *Bhoomiputra Security Alert: Order Authorization*\n\n` +
    `Namaste *${member.name}*!\n` +
    `Your Bhoomiputra Member ID *${member.id}* was requested for an order at MatsyaMart by *+91 ${cleanRequester}*.\n\n` +
    `To authorize the 15% Bhoomiputra Member Privilege for their order, share this 4-digit code:\n` +
    `👉 *${code}*\n\n` +
    `• Valid for 10 minutes\n` +
    `• If you did NOT authorize this purchase, simply ignore this message. Your membership card remains safe.\n\n` +
    `_Kolibaba Seafood Inc · Bhoomiputra Foundation_`;

  // Dispatch via Fast2SMS WhatsApp universal engine
  const dispatch = await sendFast2SMSWhatsApp(primaryPhone, alertText);

  return {
    success: true,
    maskedPhone: maskPhone(primaryPhone),
    waLink: dispatch.waLink,
  };
}

/**
 * Verifies the 4-digit delegation authorization code entered by the requester
 */
export function verifyDelegationOtp(params: {
  memberId: string;
  requesterPhone: string;
  code: string;
}): {
  success: boolean;
  delegationToken?: string | undefined;
  member?: {
    id: string;
    name: string;
    tier: string;
    settlement: string;
  } | undefined;
  error?: string | undefined;
} {
  const cleanRequester = clean10DigitPhone(params.requesterPhone);
  const cleanId = params.memberId.trim().toUpperCase();
  const sessionKey = `${cleanId}_${cleanRequester}`;
  const session = delegationSessions.get(sessionKey);

  if (!session) {
    return {
      success: false,
      error: "No authorization request found. Please request a new code.",
    };
  }

  if (Date.now() > session.expiresAt) {
    delegationSessions.delete(sessionKey);
    return {
      success: false,
      error: "Authorization code has expired. Please request a fresh code.",
    };
  }

  if (session.code.trim() !== params.code.trim()) {
    return {
      success: false,
      error: "Invalid 4-digit authorization code. Please verify with the member.",
    };
  }

  // Successful verification -> generate single-use delegation token
  session.verified = true;
  const delegationToken = `bpf_auth_${crypto.randomUUID().replace(/-/g, "")}`;
  session.delegationToken = delegationToken;

  verifiedTokens.set(delegationToken, session);

  return {
    success: true,
    delegationToken,
    member: {
      id: session.memberId,
      name: session.memberName,
      tier: "Authorized Delegation",
      settlement: "Verified Purchase",
    },
  };
}

/**
 * Server-Side Gate: Validates discount eligibility for an order
 * Enforces zero-theft invariant before Razorpay or Order creation
 */
export async function verifyMemberDiscountEligibility(params: {
  memberId?: string;
  customerPhone?: string;
  delegationToken?: string;
}): Promise<{
  eligible: boolean;
  discountPercent: number;
  reason?: string;
  requiresPhone?: boolean;
  member?: BhoomiputraMemberRecord;
}> {
  if (!params.memberId) {
    return { eligible: false, discountPercent: 0, reason: "No member ID provided" };
  }

  const cleanPhone = clean10DigitPhone(params.customerPhone);
  const member = await findBhoomiputraMember({ memberId: params.memberId, phone: cleanPhone });

  if (!member) {
    return {
      eligible: false,
      discountPercent: 0,
      reason: `Member ID "${params.memberId}" does not exist in active registry`,
    };
  }

  // Check 1: Direct phone ownership match against the registered number only
  if (cleanPhone && (member.phones.includes(cleanPhone) || member.phoneVerified === true)) {
    return { eligible: true, discountPercent: 15, member };
  }

  // Check 1b: If customer has not entered phone number yet, prompt for phone rather than flagging theft
  if (!cleanPhone) {
    return {
      eligible: false,
      discountPercent: 0,
      requiresPhone: true,
      reason: "Please enter your 10-digit mobile number in Contact Information below to verify card ownership.",
      member,
    };
  }

  // Check 2: Valid verified delegation token for this order
  if (params.delegationToken) {
    const verified = verifiedTokens.get(params.delegationToken);
    if (
      verified &&
      verified.verified &&
      verified.memberId.toUpperCase() === member.id.toUpperCase() &&
      clean10DigitPhone(verified.requesterPhone) === cleanPhone &&
      Date.now() < verified.expiresAt
    ) {
      return {
        eligible: true,
        discountPercent: 15,
        member,
      };
    }
  }

  // Check 3: Mismatch -> Theft Block
  return {
    eligible: false,
    discountPercent: 0,
    reason: `Membership ${member.id} belongs to ${maskPhone(member.phones[0])}. Unauthorized access blocked.`,
    member,
  };
}

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Order, Listing, DispatchJob } from "../../types";
import { useData } from "../../context/DataContext";
import { formatDate, formatTime, formatINR } from "../../lib/utils";
import {
  MATSYAMART_WHATSAPP_NUMBER,
  MATSYAMART_WHATSAPP_DISPLAY,
  normalizeWhatsAppPhone,
  formatPhoneDisplay,
  buildWhatsAppUrl,
  openWhatsApp,
  buildPassMessage,
  buildCookRosterMessage,
  buildGuideManifestMessage,
  buildArtisanRosterMessage,
  buildGoodsTrackingMessage,
  buildTidalAdvisoryMessage,
} from "../../lib/whatsapp";
import {
  buildMultilingualHostNotice,
  sendMetaCloudWhatsAppMessage,
  SupportedLanguage,
} from "../../lib/services/whatsappMeta";
import {
  Search,
  Send,
  Plus,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Phone,
  Share2,
  Users,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Compass,
  Utensils,
  Palette,
  Package,
  User,
  Radio,
  FileText,
  Copy,
  ChevronRight,
  Filter,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

interface WhatsAppHubProps {
  orders: Order[];
  listings: Listing[];
}

interface ChatMessage {
  id: string;
  sender: "customer" | "coordinator";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  customerName: string;
  phone: string;
  pillar: "food" | "walks" | "workshops" | "goods";
  experienceTitle: string;
  orderRef: string;
  unreadCount: number;
  lastMessageTime: string;
  messages: ChatMessage[];
  isWindowOpen: boolean;
  isOptedOut?: boolean;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({ orders, listings }) => {
  const { slots, partners, places } = useData();
  const [activeSubTab, setActiveSubTab] = useState<"dispatches" | "chats" | "broadcasts" | "groups" | "settings">("dispatches");

  // Host Dispatches (Scheduled for 18:00 IST Previous Day)
  const [hostDispatches, setHostDispatches] = useState<Array<{
    id: string;
    hostName: string;
    hostPhone: string;
    offeringTitle: string;
    pillar: "food" | "walks" | "workshops";
    dateStr: string;
    timeStr: string;
    venueName: string;
    mapsUrl: string;
    totalGuests: number;
    totalSeats: number;
    estimatedPayoutINR: number;
    attendees: Array<{ name: string; phone: string; seats: number }>;
    status: "queued" | "sent" | "suppressed";
    language: SupportedLanguage;
  }>>([
    {
      id: "disp-1",
      hostName: "Ramesh Koli",
      hostPhone: "+91 98201 44512",
      offeringTitle: "Intertidal Dawn Trail & Heritage Harbor Walk",
      pillar: "walks",
      dateStr: "Tomorrow (Dawn Tide)",
      timeStr: "06:30 AM – 09:00 AM",
      venueName: "Versova Koliwada Harbor Gate 2",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=19.1316,72.8109",
      totalGuests: 7,
      totalSeats: 14,
      estimatedPayoutINR: 10115,
      attendees: [
        { name: "Aarav Patel", phone: "+91 98201 11223", seats: 2 },
        { name: "Pooja Shah", phone: "+91 98201 44556", seats: 3 },
        { name: "Vikram Mehta", phone: "+91 98201 77889", seats: 2 },
      ],
      status: "queued",
      language: "en",
    },
    {
      id: "disp-2",
      hostName: "Ashwini Tandel",
      hostPhone: "+91 99284 77158",
      offeringTitle: "Authentic Koli Courtyard Seafood Feast",
      pillar: "food",
      dateStr: "Tomorrow (Sunset Banquet)",
      timeStr: "12:30 PM – 03:30 PM",
      venueName: "Versova Gaothan Courtyard, Villa 4",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=19.1316,72.8109",
      totalGuests: 5,
      totalSeats: 12,
      estimatedPayoutINR: 12240,
      attendees: [
        { name: "Rohan Deshmukh", phone: "+91 98202 33445", seats: 4 },
        { name: "Sneha Nair", phone: "+91 98202 55667", seats: 2 },
        { name: "Kunal Joshi", phone: "+91 98202 88990", seats: 6 },
      ],
      status: "queued",
      language: "mr",
    },
    {
      id: "disp-3",
      hostName: "Kashinath Nakhawa",
      hostPhone: "+91 98192 33410",
      offeringTitle: "Traditional Net-Weaving & Knotting Masterclass",
      pillar: "workshops",
      dateStr: "Tomorrow (Afternoon Session)",
      timeStr: "02:00 PM – 05:00 PM",
      venueName: "Sassoon Dock Heritage Shed, Colaba",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=18.9142,72.8277",
      totalGuests: 4,
      totalSeats: 8,
      estimatedPayoutINR: 10200,
      attendees: [
        { name: "Aditya Roy", phone: "+91 98203 11224", seats: 2 },
        { name: "Meera Kulkarni", phone: "+91 98203 44557", seats: 2 },
      ],
      status: "queued",
      language: "hi",
    },
  ]);

  // Build conversations from existing orders & mock real interactions
  const initialConversations = useMemo<Conversation[]>(() => {
    return orders.slice(0, 8).map((order, idx) => {
      const expItem = order.items.find((i) => i.listing?.type === "experience");
      const goodsItem = order.items.find((i) => i.listing?.type === "product");
      const listing = expItem?.listing || goodsItem?.listing || listings[0];
      const pillar = (listing?.pillar || "food") as Conversation["pillar"];

      const isSample1 = idx === 0;
      const isSample2 = idx === 1;

      const sampleMessages: ChatMessage[] = [
        {
          id: `m-1-${order.id}`,
          sender: "coordinator",
          text: `Namaste ${order.customer_name}! Your booking for ${listing?.title || "Coastal Experience"} (Ref: ${order.order_ref}) is confirmed.`,
          timestamp: "Yesterday, 4:15 PM",
          status: "read",
        },
        {
          id: `m-2-${order.id}`,
          sender: "customer",
          text: isSample1
            ? "Thank you! What time should we reach the Sassoon Docks gate?"
            : isSample2
              ? "Are mud boots provided at the harbor?"
              : "Can I bring 1 more guest with me?",
          timestamp: "Yesterday, 4:32 PM",
          status: "read",
        },
        {
          id: `m-3-${order.id}`,
          sender: "coordinator",
          text: isSample1
            ? "Please arrive at 6:15 AM sharp at Gate 3. High tide will peak around 7:10 AM."
            : isSample2
              ? "Yes! Sanitized gumboots are provided on-ground for all registered walkers."
              : "Yes, you can register them on spot or book directly via MatsyaMart.",
          timestamp: "Today, 9:20 AM",
          status: "delivered",
        },
      ];

      return {
        id: order.id,
        customerName: order.customer_name,
        phone: order.customer_phone || "+91 98201 11223",
        pillar,
        experienceTitle: listing?.title || "Coastal Experience",
        orderRef: order.order_ref,
        unreadCount: idx === 0 ? 1 : 0,
        lastMessageTime: idx === 0 ? "9:20 AM" : "Yesterday",
        messages: sampleMessages,
        isWindowOpen: true,
      };
    });
  }, [orders, listings]);

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    initialConversations[0]?.id || "",
  );
  const [chatSearch, setChatSearch] = useState("");
  const [composerText, setComposerText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // New Chat Modal State
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatInitialMsg, setNewChatInitialMsg] = useState("Namaste! Reaching out from MatsyaMart Coastal Command regarding your reservation.");

  const activeConv = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId) || conversations[0];
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  // Send message in active chat thread
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!composerText.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "coordinator",
      text: composerText.trim(),
      timestamp: "Just now",
      status: "sent",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessageTime: "Just now",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      }),
    );

    // Open WhatsApp Web/app deep link with the text
    openWhatsApp(activeConv.phone, composerText.trim());
    setComposerText("");
    toast.success(`WhatsApp message dispatched to ${activeConv.customerName}`);
  };

  // Canned quick replies
  const handleInsertCanned = (cannedText: string) => {
    setComposerText(cannedText);
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim() || !newChatPhone.trim()) {
      toast.error("Please enter a contact name and phone number.");
      return;
    }

    const newConv: Conversation = {
      id: `chat-${Date.now()}`,
      customerName: newChatName.trim(),
      phone: newChatPhone.trim(),
      pillar: "food",
      experienceTitle: "Custom Inquiry",
      orderRef: `MM-INQ-${Date.now().toString().slice(-4)}`,
      unreadCount: 0,
      lastMessageTime: "Just now",
      isWindowOpen: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "coordinator",
          text: newChatInitialMsg.trim(),
          timestamp: "Just now",
          status: "sent",
        },
      ],
    };

    setConversations([newConv, ...conversations]);
    setSelectedConversationId(newConv.id);
    setIsNewChatOpen(false);
    openWhatsApp(newChatPhone.trim(), newChatInitialMsg.trim());
    toast.success(`New chat started with ${newChatName}`);
  };

  // Broadcast Composer State
  const [broadcastAudience, setBroadcastAudience] = useState<"all" | "food" | "walks" | "workshops" | "goods">("food");
  const [broadcastTitle, setBroadcastTitle] = useState("Tomorrow's High Tide Arrival Advisory");
  const [broadcastText, setBroadcastText] = useState(
    "Namaste {{name}}! Maritime advisory for {{experience}}: High tide is expected at 6:45 AM tomorrow. Please arrive 15 minutes early at {{venue}} with water-resistant footwear. Entry pass: {{pass_link}}",
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const broadcastAudienceCount = useMemo(() => {
    if (broadcastAudience === "all") return orders.length;
    return orders.filter((o) => o.items.some((i) => i.listing?.pillar === broadcastAudience)).length || 6;
  }, [orders, broadcastAudience]);

  const handleDispatchBroadcast = () => {
    if (!broadcastText.trim()) {
      toast.error("Please write a broadcast message.");
      return;
    }
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      openWhatsApp(MATSYAMART_WHATSAPP_NUMBER, broadcastText.replace("{{name}}", "Community Attendee").replace("{{experience}}", "Coastal Gathering").replace("{{venue}}", "Versova Jetty").replace("{{pass_link}}", "https://matsyamart.com"));
      toast.success(`Broadcast "${broadcastTitle}" queued to ${broadcastAudienceCount} recipients on WhatsApp!`);
    }, 800);
  };

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    const q = chatSearch.toLowerCase();
    return conversations.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.experienceTitle.toLowerCase().includes(q) ||
        c.orderRef.toLowerCase().includes(q),
    );
  }, [conversations, chatSearch]);

  const handleSetDispatchLanguage = (id: string, language: SupportedLanguage) => {
    setHostDispatches((prev) =>
      prev.map((d) => (d.id === id ? { ...d, language } : d)),
    );
  };

  const handleToggleSuppression = (id: string) => {
    setHostDispatches((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === "suppressed" ? "queued" : "suppressed";
          toast.info(
            nextStatus === "suppressed"
              ? `Host notice for ${d.hostName} suppressed. No automated message will be sent.`
              : `Host notice for ${d.hostName} re-queued for 18:00 IST dispatch.`,
          );
          return { ...d, status: nextStatus };
        }
        return d;
      }),
    );
  };

  const handleSendMetaDispatch = async (dispatchItem: (typeof hostDispatches)[0]) => {
    if (dispatchItem.status === "suppressed") {
      toast.error("This dispatch is suppressed. Unsuppress it first to send.");
      return;
    }
    const { text } = buildMultilingualHostNotice({
      hostName: dispatchItem.hostName,
      hostPhone: dispatchItem.hostPhone,
      offeringTitle: dispatchItem.offeringTitle,
      pillar: dispatchItem.pillar,
      dateStr: dispatchItem.dateStr,
      timeStr: dispatchItem.timeStr,
      venueName: dispatchItem.venueName,
      mapsUrl: dispatchItem.mapsUrl,
      totalGuests: dispatchItem.totalGuests,
      totalSeats: dispatchItem.totalSeats,
      estimatedPayoutINR: dispatchItem.estimatedPayoutINR,
      attendees: dispatchItem.attendees,
      language: dispatchItem.language,
    });

    const res = await sendMetaCloudWhatsAppMessage(dispatchItem.hostPhone, text);
    if (res.success) {
      setHostDispatches((prev) =>
        prev.map((d) => (d.id === dispatchItem.id ? { ...d, status: "sent" } : d)),
      );
      toast.success(`Dispatched via Meta Cloud API to ${dispatchItem.hostName} (${dispatchItem.hostPhone})!`);
    } else {
      toast.error(`Meta Cloud API error: ${res.error}`);
    }
  };

  const handleOpenManualWhatsApp = (dispatchItem: (typeof hostDispatches)[0]) => {
    const { text } = buildMultilingualHostNotice({
      hostName: dispatchItem.hostName,
      hostPhone: dispatchItem.hostPhone,
      offeringTitle: dispatchItem.offeringTitle,
      pillar: dispatchItem.pillar,
      dateStr: dispatchItem.dateStr,
      timeStr: dispatchItem.timeStr,
      venueName: dispatchItem.venueName,
      mapsUrl: dispatchItem.mapsUrl,
      totalGuests: dispatchItem.totalGuests,
      totalSeats: dispatchItem.totalSeats,
      estimatedPayoutINR: dispatchItem.estimatedPayoutINR,
      attendees: dispatchItem.attendees,
      language: dispatchItem.language,
    });
    openWhatsApp(dispatchItem.hostPhone, text);
  };

  return (
    <div className="space-y-6 text-[#f5edeb]">
      {/* Top Header & Sub-Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#dab38c]/20">
        <div className="flex items-center gap-1.5 p-1 bg-[#35160e]/80 border border-[#dab38c]/20 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveSubTab("dispatches")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "dispatches"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Host Notices (18:00 IST)</span>
          </button>
          <button
            onClick={() => setActiveSubTab("chats")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "chats"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chats ({conversations.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("broadcasts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "broadcasts"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Day-Before Broadcasts</span>
          </button>
          <button
            onClick={() => setActiveSubTab("groups")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "groups"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community Groups</span>
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "settings"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gateway &amp; Compliance</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#25D366]/20 border border-[#25D366]/40 text-[#4ade80] rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>WhatsApp Active: {MATSYAMART_WHATSAPP_DISPLAY}</span>
          </div>

          <button
            onClick={() => setIsNewChatOpen(true)}
            className="px-3.5 py-1.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Chat</span>
          </button>
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#25D366]" />
                <h3 className="font-display font-bold text-base text-[#f5edeb]">
                  Start WhatsApp Conversation
                </h3>
              </div>
              <button
                onClick={() => setIsNewChatOpen(false)}
                className="text-[#dab38c] hover:text-[#f5edeb] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Patil"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  WhatsApp Phone (Indian 10-digit or +91) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 98192 33410"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Initial Message
                </label>
                <textarea
                  rows={3}
                  value={newChatInitialMsg}
                  onChange={(e) => setNewChatInitialMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dab38c]/15">
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#dab38c] hover:bg-[#35160e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Launch WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 0: AUTOMATED HOST NOTICES (18:00 IST PREVIOUS DAY) */}
      {activeSubTab === "dispatches" && (
        <div className="space-y-6">
          {/* Dispatch Policy & Meta API Status Banner */}
          <div className="bg-gradient-to-br from-[#35160e] via-[#29100b] to-[#1f0b07] border border-[#dab38c]/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e3a157] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#ffde59]" />
                  <span>PREVIOUS-DAY 18:00 IST AUTOMATED HOST NOTICES</span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mt-1">
                  Host Manifest Dispatches &amp; Meta Cloud Delivery
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Meta Cloud API Connected</span>
                </span>
              </div>
            </div>
            <p className="text-xs text-[#dab38c]/80 leading-relaxed max-w-3xl">
              At <strong>6:00 PM IST on the previous calendar day</strong>, MatsyaMart dispatches the verified attendee manifest, timing, venue GPS, and net payout calculation directly to each host's WhatsApp. Dispatches are translated into <strong>English, Marathi, or Hindi</strong> and can be suppressed or manually expedited below.
            </p>
          </div>

          {/* Quick Host Portal Dispatch & Link Generator */}
          <div className="bg-[#1f0b07] border border-[#dab38c]/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#35160e] text-[#e3a157] flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#f5edeb]">
                  Host Gate Scanner Portal: <code className="text-[#e3a157] font-mono">/host</code>
                </div>
                <p className="text-xs text-[#dab38c]/70">
                  Universal gate scanner for verified community hosts. Direct link with pre-filled phone saves credentials automatically.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/host`;
                  navigator.clipboard.writeText(url);
                  toast.success("Copied universal Host Portal URL (/host)!");
                }}
                className="px-3.5 py-2 bg-[#35160e] hover:bg-[#4a1f14] text-[#dab38c] hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#dab38c]/20"
              >
                <Copy className="w-3.5 h-3.5 text-[#e3a157]" />
                <span>Copy Universal Link</span>
              </button>
              <a
                href="/host"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch Host Portal ↗</span>
              </a>
            </div>
          </div>

          {/* List of Host Dispatches */}
          <div className="space-y-4">
            {hostDispatches.map((dispatchItem) => {
              const notice = buildMultilingualHostNotice({
                hostName: dispatchItem.hostName,
                hostPhone: dispatchItem.hostPhone,
                offeringTitle: dispatchItem.offeringTitle,
                pillar: dispatchItem.pillar,
                dateStr: dispatchItem.dateStr,
                timeStr: dispatchItem.timeStr,
                venueName: dispatchItem.venueName,
                mapsUrl: dispatchItem.mapsUrl,
                totalGuests: dispatchItem.totalGuests,
                totalSeats: dispatchItem.totalSeats,
                estimatedPayoutINR: dispatchItem.estimatedPayoutINR,
                attendees: dispatchItem.attendees,
                language: dispatchItem.language,
              });

              return (
                <div
                  key={dispatchItem.id}
                  className={`bg-[#35160e]/90 border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 transition-all ${
                    dispatchItem.status === "suppressed"
                      ? "border-rose-500/30 bg-[#29100b]/60 opacity-80"
                      : "border-[#dab38c]/25 hover:border-[#e3a157]/40"
                  }`}
                >
                  {/* Dispatch Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#dab38c]/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e3a157]/15 border border-[#e3a157]/30 text-[#e3a157] text-[10px] font-bold uppercase tracking-wider">
                          {dispatchItem.pillar}
                        </span>
                        <h4 className="font-display font-bold text-base text-[#f5edeb]">
                          {dispatchItem.hostName} ({dispatchItem.hostPhone})
                        </h4>
                      </div>
                      <p className="text-xs text-[#dab38c] mt-0.5">
                        {dispatchItem.offeringTitle} · {dispatchItem.dateStr} ({dispatchItem.timeStr})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Language Switcher */}
                      <div className="flex items-center bg-[#1f0b07] p-1 rounded-xl border border-[#dab38c]/20 text-[11px]">
                        {(["en", "mr", "hi"] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => handleSetDispatchLanguage(dispatchItem.id, l)}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              dispatchItem.language === l
                                ? "bg-[#e3a157] text-[#29100b] shadow-xs"
                                : "text-[#dab38c] hover:text-[#f5edeb]"
                            }`}
                          >
                            {l === "en" ? "English" : l === "mr" ? "मराठी" : "हिन्दी"}
                          </button>
                        ))}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold border ${
                          dispatchItem.status === "sent"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                            : dispatchItem.status === "suppressed"
                              ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                        }`}
                      >
                        {dispatchItem.status === "sent"
                          ? "✓ Dispatched"
                          : dispatchItem.status === "suppressed"
                            ? "✕ Suppressed"
                            : "Scheduled 18:00 IST"}
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-[#1f0b07]/80 border border-[#dab38c]/15">
                      <div className="text-[10px] text-[#dab38c]/70 uppercase font-bold">Confirmed Guests</div>
                      <div className="font-bold text-white mt-0.5">{dispatchItem.totalGuests} guests ({dispatchItem.totalSeats} seats)</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#1f0b07]/80 border border-[#dab38c]/15">
                      <div className="text-[10px] text-[#dab38c]/70 uppercase font-bold">Net Payout Accrual</div>
                      <div className="font-bold text-emerald-400 mt-0.5">{formatINR(dispatchItem.estimatedPayoutINR)}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#1f0b07]/80 border border-[#dab38c]/15 col-span-2">
                      <div className="text-[10px] text-[#dab38c]/70 uppercase font-bold">Rendezvous GPS Venue</div>
                      <div className="font-bold text-sky-400 truncate mt-0.5">
                        <a href={dispatchItem.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          <span>{dispatchItem.venueName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Message Preview Drawer */}
                  <div className="p-3.5 rounded-2xl bg-[#1f0b07] border border-[#dab38c]/20 font-mono text-[11px] text-[#dab38c] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {notice.text}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-[#dab38c]/70">
                      Dispatched from official gateway: <strong>{MATSYAMART_WHATSAPP_DISPLAY}</strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const clean = normalizeWhatsAppPhone(dispatchItem.hostPhone);
                          const url = `${window.location.origin}/host?phone=${clean}`;
                          navigator.clipboard.writeText(url);
                          toast.success(`Copied Host Scanner link for ${dispatchItem.hostName}!`);
                        }}
                        className="px-3 py-1.5 bg-[#1f0b07] hover:bg-[#2c100a] border border-[#dab38c]/25 text-[#e3a157] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Copy direct scanner link with host phone pre-filled"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Scanner Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const clean = normalizeWhatsAppPhone(dispatchItem.hostPhone);
                          const url = `${window.location.origin}/host?phone=${clean}`;
                          const msg = `Namaste ${dispatchItem.hostName}!\n\nHere is your official MatsyaMart Gate Attendance Scanner link for tomorrow:\n👉 ${url}\n\nOpen this on your mobile browser at the jetty/courtyard to scan guest QR passes and check in your party.`;
                          openWhatsApp(dispatchItem.hostPhone, msg);
                        }}
                        className="px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-[#4ade80] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Send direct scanner link to host via WhatsApp"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>WhatsApp Scanner</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSuppression(dispatchItem.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          dispatchItem.status === "suppressed"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25"
                        }`}
                      >
                        {dispatchItem.status === "suppressed" ? "Re-enable Dispatch" : "Suppress Dispatch"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenManualWhatsApp(dispatchItem)}
                        className="px-3.5 py-1.5 bg-[#29100b] hover:bg-[#1f0b07] border border-[#dab38c]/30 text-[#dab38c] hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Open message in WhatsApp Web or App"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>wa.me Link</span>
                      </button>

                      <button
                        type="button"
                        disabled={dispatchItem.status === "suppressed"}
                        onClick={() => handleSendMetaDispatch(dispatchItem)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                          dispatchItem.status === "suppressed"
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-[#25D366] hover:bg-[#20ba59] text-white"
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{dispatchItem.status === "sent" ? "Re-dispatch Meta API" : "Send Meta Cloud API"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 1: LIVE TWO-WAY CHATS */}
      {activeSubTab === "chats" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[640px] bg-[#35160e]/80 border border-[#dab38c]/25 rounded-3xl overflow-hidden shadow-2xl">
          {/* Left Panel: Conversation List */}
          <div className="lg:col-span-4 border-r border-[#dab38c]/20 flex flex-col bg-[#29100b]/60">
            {/* Search Input */}
            <div className="p-3 border-b border-[#dab38c]/15">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#dab38c]/50" />
                <input
                  type="text"
                  placeholder="Search chats, guests, phones..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#35160e] border border-[#dab38c]/25 rounded-xl text-xs text-[#f5edeb] placeholder:text-[#dab38c]/40 outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#dab38c]/10">
              {filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                const lastMsg = conv.messages[conv.messages.length - 1];

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-[#e3a157]/15 border-l-4 border-[#e3a157]"
                        : "hover:bg-[#35160e]/60"
                    }`}
                  >
                    <div className="relative shrink-0 w-10 h-10 rounded-full bg-[#481f14] border border-[#dab38c]/30 flex items-center justify-center font-bold text-xs text-[#e3a157]">
                      {conv.customerName.slice(0, 2).toUpperCase()}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#29100b]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#f5edeb] truncate">
                          {conv.customerName}
                        </span>
                        <span className="text-[10px] text-[#dab38c]/60 shrink-0 font-mono">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9.5px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-[#29100b] border border-[#dab38c]/20 text-[#e3a157]">
                          {conv.pillar}
                        </span>
                        <span className="text-[11px] text-[#dab38c]/60 truncate font-mono">
                          {conv.orderRef}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-[#dab38c]/80 truncate mt-1">
                        {lastMsg?.sender === "coordinator" ? "You: " : ""}
                        {lastMsg?.text || "Started conversation"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Chat Thread & Real-time Dispatch */}
          {activeConv ? (
            <div className="lg:col-span-8 flex flex-col justify-between h-full bg-[#29100b]/40">
              {/* Thread Header */}
              <div className="p-4 border-b border-[#dab38c]/20 flex items-center justify-between bg-[#35160e]/90">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#481f14] border border-[#dab38c]/30 flex items-center justify-center font-bold text-sm text-[#e3a157]">
                    {activeConv.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-[#f5edeb]">
                        {activeConv.customerName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        ● 24h Care Window Open
                      </span>
                    </div>
                    <div className="text-xs text-[#dab38c]/80 flex items-center gap-2 mt-0.5 font-mono">
                      <span>{formatPhoneDisplay(activeConv.phone)}</span>
                      <span>·</span>
                      <span className="text-[#e3a157]">{activeConv.experienceTitle}</span>
                      <span>·</span>
                      <span>{activeConv.orderRef}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppUrl(activeConv.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Open in WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Message History Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {activeConv.messages.map((msg) => {
                  const isCoord = msg.sender === "coordinator";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCoord ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                          isCoord
                            ? "bg-[#005c4b] text-white rounded-tr-none border border-emerald-600/30"
                            : "bg-[#35160e] text-[#f5edeb] rounded-tl-none border border-[#dab38c]/25"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-mono ${
                            isCoord ? "text-emerald-200/80" : "text-[#dab38c]/60"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isCoord && <CheckCheck className="w-3.5 h-3.5 text-sky-300" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned Quick Dispatch Response Strip */}
              <div className="px-4 py-2 bg-[#35160e]/95 border-t border-[#dab38c]/20">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3a157] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ffde59]" />
                  <span>One-Click Canned Dispatches</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <button
                    onClick={() =>
                      handleInsertCanned(
                        `🎟️ Namaste ${activeConv.customerName}! Here is your verified MatsyaMart 9:16 mobile pass for ${activeConv.experienceTitle} (Ref: ${activeConv.orderRef}): https://matsyamart.com/order/confirmation/${activeConv.orderRef}`,
                      )
                    }
                    className="px-2.5 py-1 bg-[#29100b] hover:bg-[#481f14] border border-[#dab38c]/25 rounded-lg text-[#dab38c] hover:text-[#f5edeb] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    🎟️ Resend 9:16 Pass
                  </button>
                  <button
                    onClick={() =>
                      handleInsertCanned(
                        `🌊 Coastal Advisory: High tide is forecasted at 6:45 AM tomorrow. Please arrive 15 minutes early at the harbor rendezvous.`,
                      )
                    }
                    className="px-2.5 py-1 bg-[#29100b] hover:bg-[#481f14] border border-[#dab38c]/25 rounded-lg text-[#dab38c] hover:text-[#f5edeb] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    ⚓ High Tide Advisory
                  </button>
                  <button
                    onClick={() =>
                      handleInsertCanned(
                        `📍 Secret Rendezvous Point: Enter Gate 3, look for the red tiled heritage shed on the right overlooking dry dock. GPS: https://maps.google.com/?q=18.9142,72.8277`,
                      )
                    }
                    className="px-2.5 py-1 bg-[#29100b] hover:bg-[#481f14] border border-[#dab38c]/25 rounded-lg text-[#dab38c] hover:text-[#f5edeb] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    📍 Meeting Point GPS
                  </button>
                  <button
                    onClick={() =>
                      handleInsertCanned(
                        `🐟 Namaste from your community cook! Confirming your seafood feast booking. Please inform us of any dietary restrictions or shellfish allergies prior to dawn procurement.`,
                      )
                    }
                    className="px-2.5 py-1 bg-[#29100b] hover:bg-[#481f14] border border-[#dab38c]/25 rounded-lg text-[#dab38c] hover:text-[#f5edeb] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    🐟 Dietary Check
                  </button>
                  <button
                    onClick={() =>
                      handleInsertCanned(
                        `📦 Order Update: Your artisan goods have shipped via Bluedart Express (AWB: 8941029341). Track delivery at: https://bluedart.com`,
                      )
                    }
                    className="px-2.5 py-1 bg-[#29100b] hover:bg-[#481f14] border border-[#dab38c]/25 rounded-lg text-[#dab38c] hover:text-[#f5edeb] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    📦 Courier Tracking
                  </button>
                </div>
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#dab38c]/20 bg-[#29100b] flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Type WhatsApp message to ${activeConv.customerName} (Press Enter to Send)...`}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#35160e] border border-[#dab38c]/30 rounded-2xl text-xs text-[#f5edeb] placeholder:text-[#dab38c]/40 outline-none focus:border-[#e3a157]"
                />
                <button
                  type="submit"
                  disabled={!composerText.trim()}
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-8 flex items-center justify-center p-8 text-[#dab38c]/60 text-xs">
              Select a conversation to begin WhatsApp dispatch.
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DAY-BEFORE AUDIENCE BROADCASTS */}
      {activeSubTab === "broadcasts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Audience & Composer */}
          <div className="lg:col-span-7 bg-[#35160e]/85 border border-[#dab38c]/25 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#f5edeb]">
                Compose Coastal Broadcast
              </h3>
              <p className="text-xs text-[#dab38c]/80 mt-0.5">
                Dispatch verified operational updates, high tide notices, and arrival notes to tomorrow's guests on WhatsApp.
              </p>
            </div>

            {/* Audience Filter Pills */}
            <div>
              <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1.5">
                Target Audience Cohort ({broadcastAudienceCount} Recipients Eligible)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: "all", label: "All Customers", icon: Users },
                  { id: "food", label: "Tomorrow's Diners", icon: Utensils },
                  { id: "walks", label: "Heritage Walkers", icon: Compass },
                  { id: "workshops", label: "Artisan Students", icon: Palette },
                  { id: "goods", label: "Artisan Buyers", icon: Package },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setBroadcastAudience(aud.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      broadcastAudience === aud.id
                        ? "bg-[#e3a157] text-[#29100b] border-[#e3a157] font-bold shadow-md"
                        : "bg-[#29100b] text-[#dab38c] border-[#dab38c]/25 hover:bg-[#35160e]"
                    }`}
                  >
                    <aud.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{aud.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                Broadcast Campaign Subject
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#29100b] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#dab38c] uppercase">
                  Message Body &amp; Placeholders
                </label>
                <div className="flex items-center gap-1 text-[10px] text-[#e3a157] font-mono">
                  <span>Variables:</span>
                  <button
                    type="button"
                    onClick={() => setBroadcastText((prev) => `${prev} {{name}}`)}
                    className="underline hover:text-white"
                  >
                    name
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setBroadcastText((prev) => `${prev} {{experience}}`)}
                    className="underline hover:text-white"
                  >
                    experience
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setBroadcastText((prev) => `${prev} {{venue}}`)}
                    className="underline hover:text-white"
                  >
                    venue
                  </button>
                </div>
              </div>
              <textarea
                rows={5}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#29100b] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] outline-none resize-none leading-relaxed"
              />
              <div className="text-[10px] text-[#dab38c]/60 mt-1 flex items-center justify-between font-mono">
                <span>{broadcastText.length} characters</span>
                <span>Meta utility template rate: ₹0.15/msg</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#dab38c]/15 flex items-center justify-between">
              <span className="text-xs text-[#dab38c]">
                Ready to dispatch to <strong>{broadcastAudienceCount}</strong> recipients
              </span>
              <button
                type="button"
                disabled={isBroadcasting}
                onClick={handleDispatchBroadcast}
                className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isBroadcasting ? "Broadcasting..." : "Dispatch Broadcast"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Phone Mockup Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-[320px] rounded-[36px] bg-[#111b21] border-4 border-[#2a3942] p-4 shadow-2xl space-y-3 select-none text-white font-sans">
              {/* Fake Phone Top Bar */}
              <div className="flex items-center justify-between px-2 text-[11px] text-gray-400">
                <span className="font-bold">9:41</span>
                <span className="text-[10px]">MatsyaMart Official</span>
              </div>

              {/* Chat Bubble in Phone */}
              <div className="bg-[#005c4b] rounded-2xl rounded-tr-none p-3.5 text-xs text-white leading-relaxed shadow-md border border-emerald-500/20">
                <div className="text-[10px] font-bold text-[#ffde59] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{broadcastTitle}</span>
                </div>
                <p className="whitespace-pre-wrap text-[11.5px]">
                  {broadcastText
                    .replace("{{name}}", "Rahul")
                    .replace("{{experience}}", "Sassoon Docks Dawn Feasting")
                    .replace("{{venue}}", "Versova Jetty")
                    .replace("{{pass_link}}", "https://matsyamart.com/pass/MM-4421")}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-200/70 font-mono">
                  <span>9:42 AM</span>
                  <CheckCheck className="w-3 h-3 text-sky-300" />
                </div>
              </div>

              {/* Verified Sender Footer */}
              <div className="text-center text-[10px] text-gray-400 font-mono pt-2 border-t border-gray-800">
                From: {MATSYAMART_WHATSAPP_DISPLAY} (Verified)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMMUNITY WHATSAPP GROUPS */}
      {activeSubTab === "groups" && (
        <div className="space-y-5">
          <div className="p-4 bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl text-xs text-[#dab38c] flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-sm text-[#f5edeb]">
                Official WhatsApp Community Cohorts
              </h4>
              <p className="mt-0.5">
                Coordinators and community members stay connected through invite-only coastal cohorts managed by Kolibaba Seafood Inc.
              </p>
            </div>
            <div className="text-right font-mono text-[11px] text-[#e3a157]">
              4 Active Cohorts · 78 Members
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "Versova Koliwada Dining Cohort",
                purpose: "Home dining chefs, courtyard hosts, and weekend feast coordination.",
                members: 24,
                inviteUrl: "https://chat.whatsapp.com/invites/versova-dining",
                icon: Utensils,
              },
              {
                name: "Sassoon Intertidal Harbor Guides",
                purpose: "Dawn walk navigators, tide monitoring, and harbor safety alerts.",
                members: 18,
                inviteUrl: "https://chat.whatsapp.com/invites/sassoon-guides",
                icon: Compass,
              },
              {
                name: "Indigenous Net-Weaving Apprentice Circle",
                purpose: "Master artisans, shuttle toolkits, and student batch updates.",
                members: 16,
                inviteUrl: "https://chat.whatsapp.com/invites/net-weaving",
                icon: Palette,
              },
              {
                name: "Koli Coastal Women Artisan Collective",
                purpose: "Dried fish pantry batches, sun-drying schedules, and courier shipping.",
                members: 20,
                inviteUrl: "https://chat.whatsapp.com/invites/koli-artisans",
                icon: Package,
              },
            ].map((grp) => (
              <div
                key={grp.name}
                className="bg-[#35160e]/85 border border-[#dab38c]/25 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#29100b] rounded-xl border border-[#dab38c]/20 text-[#e3a157]">
                        <grp.icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#f5edeb]">
                        {grp.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#29100b] text-emerald-400 border border-[#dab38c]/20">
                      {grp.members} Members
                    </span>
                  </div>
                  <p className="text-xs text-[#dab38c]/80 mt-2">
                    {grp.purpose}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#dab38c]/15 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-[#dab38c]/60">
                    chat.whatsapp.com/invites/...
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(grp.inviteUrl);
                        toast.success(`Copied invite link for ${grp.name}!`);
                      }}
                      className="px-2.5 py-1.5 bg-[#29100b] hover:bg-[#1f0b07] text-[#dab38c] hover:text-white rounded-xl text-xs font-bold border border-[#dab38c]/25 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </button>
                    <a
                      href={grp.inviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
                    >
                      <span>Join Group</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: OPT-OUTS & SETTINGS */}
      {activeSubTab === "settings" && (
        <div className="bg-[#35160e]/85 border border-[#dab38c]/25 rounded-3xl p-6 shadow-xl space-y-5 text-xs">
          <div>
            <h3 className="font-display font-bold text-lg text-[#f5edeb]">
              WhatsApp Business Gateway &amp; DPDP Compliance
            </h3>
            <p className="text-xs text-[#dab38c]/80 mt-0.5">
              Configure business sender identity and respect customer opt-out preferences under Indian Digital Personal Data Protection (DPDP) norms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#29100b] border border-[#dab38c]/20 rounded-2xl space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3a157]">
                Official Meta Sender Number
              </div>
              <div className="font-mono text-base font-bold text-white">
                {MATSYAMART_WHATSAPP_DISPLAY}
              </div>
              <p className="text-[11px] text-[#dab38c]/70">
                Operated by Kolibaba Seafood Inc in strategic partnership with Bhoomiputra Foundation.
              </p>
            </div>

            <div className="p-4 bg-[#29100b] border border-[#dab38c]/20 rounded-2xl space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3a157]">
                Meta Cloud API Status
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-400">Connected &amp; Verified</span>
              </div>
              <p className="text-[11px] text-[#dab38c]/70">
                24-hour customer service window enabled. Template rate: Utility ₹0.15 / Marketing ₹0.88.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#dab38c]/15">
            <h4 className="font-bold text-sm text-[#f5edeb] mb-2">
              Customer Opt-Out Register (0 Opted-Out)
            </h4>
            <div className="p-4 bg-[#29100b] border border-[#dab38c]/20 rounded-2xl text-center text-[#dab38c]/60">
              No customers have requested WhatsApp communication opt-out. All registered booking attendees remain reachable for operational harbor safety notices.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

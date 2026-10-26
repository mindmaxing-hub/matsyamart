import React, { useState } from "react";
import { PolicyNav } from "../components/policies/PolicyNav";
import { PolicyFooterCard } from "../components/policies/PolicyFooterCard";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Order Support");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error("Please fill in your name, phone number, and message.");
      return;
    }

    toast.success("Your inquiry has been received. Our team will contact you shortly.");
    setSubmitted(true);
  };

  return (
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#e3a157] selection:text-[#29100b]">
      <div className="max-w-4xl mx-auto">
        <PolicyNav current="contact" />

        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#dab38c] border border-[#dab38c]/30 text-xs font-medium">
            Customer Support &amp; Merchant Contact
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#f5edeb] tracking-tight">
            Contact Us
          </h1>
          <p className="text-xs text-[#dab38c]/70 font-mono">
            Direct communication channels for order assistance, host inquiries, and compliance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Direct Contact Cards (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#e3a157] font-bold text-sm">
                <Phone className="h-4 w-4" />
                <span>Phone &amp; WhatsApp Support</span>
              </div>
              <p className="text-xs text-[#dab38c]/80 leading-relaxed">
                Connect with our coastal coordination desk directly:
              </p>
              <div className="space-y-1 text-xs">
                <a
                  href="tel:+917666511511"
                  className="block font-mono text-[#f5edeb] hover:text-[#e3a157] font-bold text-sm"
                >
                  +91 76665 11511
                </a>
                <a
                  href="https://wa.me/917666511511"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#e3a157] font-bold text-sm">
                <Mail className="h-4 w-4" />
                <span>Customer Email</span>
              </div>
              <p className="text-xs text-[#dab38c]/80 leading-relaxed">
                For order receipts, refunds, host partnerships, and corporate inquiries:
              </p>
              <a
                href="mailto:hello@matsyamart.com"
                className="block text-xs font-mono text-[#f5edeb] hover:text-[#e3a157] font-bold underline"
              >
                hello@matsyamart.com
              </a>
            </div>

            <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#e3a157] font-bold text-sm">
                <Clock className="h-4 w-4" />
                <span>Support Hours</span>
              </div>
              <p className="text-xs text-[#dab38c]/80 leading-relaxed">
                <strong>Monday to Sunday:</strong> 7:00 AM to 8:00 PM IST
              </p>
              <p className="text-[11px] text-[#dab38c]/60">
                Operating alongside the morning tide catches and evening shoreline walks.
              </p>
            </div>

            <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#e3a157] font-bold text-sm">
                <MapPin className="h-4 w-4" />
                <span>Registered Office Address</span>
              </div>
              <p className="text-xs text-[#dab38c]/80 leading-relaxed">
                <strong>Kolibaba Seafood Inc. (MatsyaMart)</strong><br />
                101, Samudra Darshan, Budha Lane 2,<br />
                Versova, Andheri West,<br />
                Mumbai, Maharashtra - 400061, India<br />
                <span className="font-mono text-[11px] text-[#e3a157]">GSTIN: 27ABBFK9637R1ZF</span>
              </p>
            </div>
          </div>

          {/* Interactive Message Form (3 cols) */}
          <div className="lg:col-span-3 bg-[#1f0b07] p-6 sm:p-8 rounded-2xl border border-[#dab38c]/20">
            <h2 className="font-display text-xl font-bold text-[#f5edeb] mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs text-[#dab38c]/70 mb-6">
              Have a question about an experience, fresh delivery, or order refund? Fill in your details below:
            </p>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-black/20 rounded-xl border border-[#dab38c]/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-sm text-[#f5edeb]">Message Transmitted</h3>
                <p className="text-xs text-[#dab38c]/80 max-w-sm mx-auto">
                  Thank you, <strong>{name}</strong>. Our coastal team has received your query and will respond via WhatsApp or email within operating hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setMessage("");
                  }}
                  className="text-xs text-[#e3a157] underline hover:text-[#f5edeb] pt-2"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c]/70 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full bg-black/30 border border-[#dab38c]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#f5edeb] placeholder-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c]/70 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="w-full bg-black/30 border border-[#dab38c]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#f5edeb] placeholder-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c]/70 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. vikram@example.com"
                      className="w-full bg-black/30 border border-[#dab38c]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#f5edeb] placeholder-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c]/70 mb-1">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-black/30 border border-[#dab38c]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#f5edeb] focus:outline-none focus:border-[#e3a157]"
                    >
                      <option value="Order Support" className="bg-[#1f0b07]">Order &amp; Delivery Support</option>
                      <option value="Experience Booking" className="bg-[#1f0b07]">Experience &amp; Walk Booking</option>
                      <option value="Cancellation / Refund" className="bg-[#1f0b07]">Cancellation / Refund Query</option>
                      <option value="Host Partnership" className="bg-[#1f0b07]">Community Host Partnership</option>
                      <option value="General Inquiry" className="bg-[#1f0b07]">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c]/70 mb-1">
                    Your Message / Order Reference *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Include your Order Ref (e.g. MM-EXP-2026-XXXX) or describe how we can assist..."
                    className="w-full bg-black/30 border border-[#dab38c]/20 rounded-xl p-3 text-xs text-[#f5edeb] placeholder-[#dab38c]/40 focus:outline-none focus:border-[#e3a157] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] px-6 py-3 rounded-full font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <PolicyFooterCard />
      </div>
    </div>
  );
};

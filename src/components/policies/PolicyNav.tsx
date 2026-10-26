import React from "react";
import { Link } from "../ui/Link";
import { ShieldCheck, FileText, Lock, RotateCcw, Truck, PhoneCall } from "lucide-react";

interface PolicyNavProps {
  current: "terms" | "privacy" | "refund" | "shipping" | "contact";
}

export const PolicyNav: React.FC<PolicyNavProps> = ({ current }) => {
  const tabs = [
    { id: "terms", label: "Terms & Conditions", href: "/terms", icon: FileText },
    { id: "privacy", label: "Privacy Policy", href: "/privacy", icon: Lock },
    { id: "refund", label: "Cancellation & Refund", href: "/refund-policy", icon: RotateCcw },
    { id: "shipping", label: "Shipping & Delivery", href: "/shipping-policy", icon: Truck },
    { id: "contact", label: "Contact Us", href: "/contact", icon: PhoneCall },
  ];

  return (
    <div className="border-b border-[#dab38c]/15 pb-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-[#e3a157]" />
        <span className="text-[11px] uppercase tracking-wider text-[#dab38c]/70 font-semibold font-mono">
          Regulatory Compliance &amp; Policies
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = current === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.href}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all ${
                isActive
                  ? "bg-[#e3a157] text-[#29100b] font-bold shadow-sm"
                  : "bg-[#1f0b07] text-[#dab38c] hover:bg-[#35160e] hover:text-[#f5edeb] border border-[#dab38c]/15"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

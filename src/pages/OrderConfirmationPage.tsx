import React from "react";
import { Link } from "../components/ui/Link";
import { useData } from "../context/DataContext";
import { DigitalPass } from "../components/order/DigitalPass";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface OrderConfirmationPageProps {
  orderRef?: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderRef: refProp,
}) => {
  let orderRef = refProp;
  if (!orderRef && typeof window !== "undefined") {
    const parts = window.location.pathname.split("/");
    orderRef = parts[parts.length - 1];
  }

  const { getOrderByRef } = useData();
  const order = orderRef ? getOrderByRef(orderRef) : undefined;

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/25 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-2xl text-[#f5edeb]">
          Order Pass Not Found
        </h2>
        <p className="text-xs text-[#dab38c]">
          We could not locate reference{" "}
          <code className="font-mono bg-[#1f0b07] text-[#e3a157] px-2 py-0.5 rounded border border-[#dab38c]/25">
            {orderRef}
          </code>
          . If you recently completed payment, please check your WhatsApp or
          return home.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-xl text-xs font-bold transition-colors shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dab38c] hover:text-[#f5edeb] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog Home
        </Link>
      </div>

      <DigitalPass order={order} />
    </div>
  );
};

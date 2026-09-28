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
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-2xl text-slate-900">
          Order Pass Not Found
        </h2>
        <p className="text-xs text-slate-500">
          We could not locate reference{" "}
          <code className="font-mono bg-slate-100 px-2 py-0.5 rounded">
            {orderRef}
          </code>
          . If you recently completed payment, please check your WhatsApp or
          return home.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ocean-800 text-white rounded-xl text-xs font-semibold"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700 hover:text-ocean-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog Home
        </Link>
      </div>

      <DigitalPass order={order} />
    </div>
  );
};

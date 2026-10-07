import React from "react";
import { Order } from "../../types";
import { formatINR } from "../../lib/utils";
import { Printer, X, Package, ShieldCheck } from "lucide-react";

interface CourierLabelProps {
  order: Order;
  onClose: () => void;
}

export const CourierLabel: React.FC<CourierLabelProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const shipping = order.shipping_address;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
        {/* Modal Controls (Not printed) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15 print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#e3a157]" />
            <h3 className="font-display font-bold text-base text-[#f5edeb]">
              Courier Packing Slip &amp; Shipping Label
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#29100b]" />
              <span>Print Label (10×4 cm)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 10x4 cm Thermal / Laser Courier Label Container */}
        <div
          id="printable-courier-label"
          className="bg-white text-black p-5 rounded-xl border-2 border-black font-sans text-xs space-y-3 shadow-md mx-auto max-w-[480px] print:m-0 print:border-none print:shadow-none print:p-0 print:max-w-none"
        >
          {/* Header Strip */}
          <div className="flex items-start justify-between border-b-2 border-black pb-2.5">
            <div>
              <div className="font-bold text-lg tracking-tight uppercase font-mono">
                MATSYAMART · EXPRESS CARGO
              </div>
              <div className="text-[10px] text-gray-700 font-medium">
                Standard Surface / Ambient Coastal Courier
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-600">
                AWB TRACKING
              </div>
              <div className="font-mono font-bold text-xs text-black">
                {order.tracking_awb || "AWB-PENDING-DISPATCH"}
              </div>
            </div>
          </div>

          {/* Barcode Mock Visual */}
          <div className="flex flex-col items-center justify-center py-1 border-b border-gray-400">
            <div className="h-9 w-full flex items-center justify-center gap-[3px] bg-white px-2">
              {Array.from({ length: 48 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-7 ${
                    idx % 3 === 0
                      ? "w-[3px] bg-black"
                      : idx % 5 === 0
                        ? "w-[1px] bg-black"
                        : "w-[2px] bg-black"
                  }`}
                />
              ))}
            </div>
            <div className="font-mono text-[10px] tracking-widest font-bold mt-0.5">
              *{order.order_ref}*
            </div>
          </div>

          {/* Sender & Consignee Columns */}
          <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-3">
            {/* FROM */}
            <div className="space-y-0.5 border-r border-gray-300 pr-2">
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
                SHIP FROM (SENDER):
              </div>
              <div className="font-bold text-xs">Kolibaba Seafood Inc</div>
              <div className="text-[10px] leading-tight text-gray-700">
                Bhoomiputra Coastal Processing Unit<br />
                Versova Jetty No. 1, Gaothan<br />
                Andheri West, Mumbai – 400061<br />
                Ph: +91 98201 44512<br />
                Email: hello@matsyamart.com
              </div>
            </div>

            {/* TO */}
            <div className="space-y-0.5 pl-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
                DELIVER TO (CONSIGNEE):
              </div>
              <div className="font-bold text-xs">{order.customer_name}</div>
              <div className="text-[10px] leading-tight text-gray-800">
                {shipping?.addressLine || "Address on file"}<br />
                {shipping?.landmark && `Landmark: ${shipping.landmark}`}<br />
                {shipping?.city || "Mumbai"}, {shipping?.state || "Maharashtra"} –{" "}
                <b className="font-mono text-xs">{shipping?.pincode || "400001"}</b><br />
                Ph: <b className="font-mono">{order.customer_phone}</b>
              </div>
            </div>
          </div>

          {/* Package Details / Manifest Grid */}
          <div className="space-y-1.5 border-b-2 border-black pb-2 text-[11px]">
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
              PACKAGE CONTENTS:
            </div>
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-gray-300 text-gray-600">
                  <th className="py-0.5">Item Description</th>
                  <th className="py-0.5 text-center">Qty</th>
                  <th className="py-0.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-0.5 font-medium">
                      {item.listing?.title || "Coastal Pantry Item"}
                    </td>
                    <td className="py-0.5 text-center font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-0.5 text-right font-mono">
                      {formatINR(item.unit_price_inr * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary & GST Declaration */}
          <div className="flex items-center justify-between text-[10px] pt-1">
            <div>
              <div className="font-bold">
                PAYMENT: PREPAID (ONLINE)
              </div>
              <div className="text-[9px] text-gray-600">
                Kolibaba Seafood Inc · GST: [TBD]
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xs font-mono">
                TOTAL: {formatINR(order.total_amount_inr)}
              </div>
              <div className="text-[9px] text-gray-500">
                Standard Care Handled
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#dab38c]/70 text-center print:hidden">
          Tip: Select 10×4 cm or 4×6 inch in your browser print dialogue.
        </div>
      </div>
    </div>
  );
};

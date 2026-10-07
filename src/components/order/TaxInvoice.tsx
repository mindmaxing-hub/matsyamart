import React from "react";
import { Order } from "../../types";
import { formatINR, formatDate } from "../../lib/utils";
import { Printer, X, FileText, CheckCircle2 } from "lucide-react";

interface TaxInvoiceProps {
  order: Order;
  onClose?: () => void;
}

export const TaxInvoice: React.FC<TaxInvoiceProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.order_ref}`;
  const totalAmount = order.total_amount_inr;

  // 18% GST calculation (inclusive)
  // Taxable Value = Total / 1.18
  const taxableValue = Math.round((totalAmount / 1.18) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableValue) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] flex flex-col text-[#f5edeb]">
        {/* Modal Controls (Not printed) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#e3a157]" />
            <h3 className="font-display font-bold text-base text-[#f5edeb]">
              Tax Invoice · Kolibaba Seafood Inc
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#29100b]" />
              <span>Print / Download PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Tax Invoice Document */}
        <div className="overflow-y-auto flex-1 bg-white text-black p-6 sm:p-8 rounded-2xl border border-gray-300 font-sans text-xs space-y-6 shadow-inner print:m-0 print:border-none print:shadow-none print:p-0">
          {/* Top Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-black pb-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-gray-500 font-mono">
                ORIGINAL FOR RECIPIENT · TAX INVOICE
              </div>
              <h1 className="font-display font-bold text-2xl text-black mt-1">
                Kolibaba Seafood Inc
              </h1>
              <div className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                In strategic partnership with Bhoomiputra Foundation<br />
                Versova Jetty No. 1, Gaothan, Andheri West<br />
                Mumbai, Maharashtra, India – 400061<br />
                <b>GSTIN:</b> 27AAACK1234F1Z5 (State Code: 27)<br />
                <b>Email:</b> hello@matsyamart.com · <b>Support:</b> +91 98201 44512
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-[11px] inline-block text-left sm:text-right">
                <div><b>Invoice No:</b> {invoiceNumber}</div>
                <div><b>Date:</b> {formatDate(order.created_at)}</div>
                <div><b>Order Ref:</b> {order.order_ref}</div>
              </div>
              <div className="text-[10px] text-gray-500 pt-1">
                Payment: <b>ONLINE (RAZORPAY)</b><br />
                Txn Ref: {order.razorpay_payment_id || "PAY_CONFIRMED"}
              </div>
            </div>
          </div>

          {/* Billed To / Shipped To Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-300 pb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                BILLED TO (CUSTOMER):
              </div>
              <div className="font-bold text-sm text-black">{order.customer_name}</div>
              <div className="text-[11px] text-gray-700 mt-0.5">
                Phone: {order.customer_phone}<br />
                Email: {order.customer_email}<br />
                Place of Supply: Maharashtra (27)
              </div>
            </div>

            {order.shipping_address && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  SHIPPING ADDRESS:
                </div>
                <div className="text-[11px] text-gray-700 leading-snug">
                  {order.shipping_address.addressLine}<br />
                  {order.shipping_address.landmark && (
                    <span>Landmark: {order.shipping_address.landmark}<br /></span>
                  )}
                  {order.shipping_address.city}, {order.shipping_address.state} –{" "}
                  <b>{order.shipping_address.pincode}</b>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50 text-gray-700">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">Description of Goods / Services</th>
                  <th className="py-2 px-2 text-center">HSN/SAC</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => {
                  const isExp = item.listing?.type === "experience";
                  const hsnCode = isExp ? "9985" : "0305";

                  return (
                    <tr key={item.id} className="text-black">
                      <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <div className="font-bold">
                          {item.listing?.title || "MatsyaMart Coastal Item"}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {isExp ? "Experiential Coastal Tourism" : "Sun-Cured Coastal Pantry"}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-gray-600">
                        {hsnCode}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-semibold">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        {formatINR(item.unit_price_inr)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-semibold">
                        {formatINR(item.unit_price_inr * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Totals Grid */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-3 border-t-2 border-black">
            <div className="text-[10px] text-gray-600 max-w-xs space-y-1">
              <div className="font-bold text-gray-800 uppercase">GST Declaration:</div>
              <p>
                We declare that this invoice shows the actual price of the goods / services
                described and that all particulars are true and correct under CGST Act, 2017.
              </p>
              {order.coupon_code && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                  Promo discount applied: <b>{order.coupon_code}</b> (-{formatINR(order.discount_amount_inr || 0)})
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Value:</span>
                <span className="font-mono">₹{taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (9.0%):</span>
                <span className="font-mono">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (9.0%):</span>
                <span className="font-mono">₹{sgst.toFixed(2)}</span>
              </div>
              {order.discount_amount_inr && order.discount_amount_inr > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatINR(order.discount_amount_inr)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-black border-t-2 border-black pt-1.5 mt-1">
                <span>Grand Total (INR):</span>
                <span className="font-mono text-base font-bold">
                  {formatINR(totalAmount)}
                </span>
              </div>
              <div className="text-[10px] text-gray-500">
                (Amount in words: Indian Rupees Only)
              </div>
            </div>
          </div>

          {/* Bottom Signatory */}
          <div className="pt-6 border-t border-gray-200 flex justify-between items-end text-[10px] text-gray-600">
            <div>
              <span>Terms: Non-transferable digital pass · Subject to Mumbai jurisdiction</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-black">For Kolibaba Seafood Inc</div>
              <div className="text-[9px] text-gray-500 mt-6">Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

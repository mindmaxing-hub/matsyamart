import React from "react";
import { Order } from "../../types";
import { formatINR } from "../../lib/utils";
import { Printer, X, Package, ExternalLink, ShieldCheck } from "lucide-react";

interface CourierLabelProps {
  order: Order;
  onClose: () => void;
}

export const CourierLabel: React.FC<CourierLabelProps> = ({ order, onClose }) => {
  const shipping = order.shipping_address;
  const awbNumber = order.tracking_awb || `BD${order.order_ref.replace(/[^\d]/g, "").padStart(8, "0")}`;

  // Direct thermal print popup window to bypass any browser modal/viewport scaling bugs
  const handleDirectThermalPrint = () => {
    const printWindow = window.open("", "_blank", "width=480,height=720");
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsRows = order.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 3px 0; font-weight: 600;">${item.listing?.title || "Artisanal Coastal Item"}</td>
          <td style="padding: 3px 0; text-align: center; font-family: monospace;">${item.quantity}</td>
          <td style="padding: 3px 0; text-align: right; font-family: monospace;">Rs. ${item.unit_price_inr * item.quantity}</td>
        </tr>`,
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label - ${order.order_ref}</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #000;
              background: #fff;
              width: 4in;
              height: 6in;
              padding: 0.22in;
              font-size: 11px;
              line-height: 1.25;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label-box {
              border: 2px solid #000;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 10px;
            }
            .header-strip {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
            }
            .brand-title {
              font-size: 15px;
              font-weight: 900;
              letter-spacing: -0.02em;
              text-transform: uppercase;
              font-family: monospace;
            }
            .brand-sub {
              font-size: 9px;
              color: #444;
              font-weight: 500;
              margin-top: 1px;
            }
            .awb-box {
              text-align: right;
            }
            .awb-label {
              font-size: 8.5px;
              font-weight: 700;
              letter-spacing: 0.05em;
              color: #555;
            }
            .awb-code {
              font-family: monospace;
              font-size: 13px;
              font-weight: 900;
            }
            .barcode-wrap {
              text-align: center;
              padding: 8px 0;
              border-bottom: 1.5px solid #000;
            }
            .barcode-bars {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 2px;
              height: 38px;
              background: #fff;
            }
            .barcode-ref {
              font-family: monospace;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 2px;
              margin-top: 3px;
            }
            .address-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              border-bottom: 1.5px solid #000;
              padding: 8px 0;
            }
            .address-col {
              font-size: 9.5px;
            }
            .address-heading {
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #444;
              margin-bottom: 2px;
            }
            .address-name {
              font-weight: 800;
              font-size: 11px;
              margin-bottom: 2px;
            }
            .contents-box {
              padding: 6px 0;
              border-bottom: 1.5px solid #000;
              flex-grow: 1;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9.5px;
              margin-top: 3px;
            }
            .items-table th {
              text-align: left;
              font-size: 8.5px;
              color: #555;
              border-bottom: 1px solid #000;
              padding-bottom: 2px;
            }
            .footer-strip {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 6px;
              font-size: 9px;
            }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div>
              <div class="header-strip">
                <div>
                  <div class="brand-title">MATSYAMART · CARGO</div>
                  <div class="brand-sub">Standard Ambient Coastal Surface Dispatch</div>
                </div>
                <div class="awb-box">
                  <div class="awb-label">AWB ROUTING</div>
                  <div class="awb-code">${awbNumber}</div>
                </div>
              </div>

              <div class="barcode-wrap">
                <div class="barcode-bars">
                  ${Array.from({ length: 54 })
                    .map(
                      (_, i) =>
                        `<div style="height: 34px; width: ${
                          i % 4 === 0 ? "3px" : i % 2 === 0 ? "1px" : "2px"
                        }; background: #000;"></div>`,
                    )
                    .join("")}
                </div>
                <div class="barcode-ref">*${order.order_ref}*</div>
              </div>

              <div class="address-grid">
                <div class="address-col" style="border-right: 1px dashed #999; padding-right: 6px;">
                  <div class="address-heading">SHIP FROM (SENDER):</div>
                  <div class="address-name">Kolibaba Seafood Inc</div>
                  <div>Bhoomiputra Coastal Unit<br/>Versova Jetty No. 1, Gaothan<br/>Andheri West, Mumbai – 400061<br/>Ph: +91 98201 44512</div>
                </div>
                <div class="address-col">
                  <div class="address-heading">DELIVER TO (CONSIGNEE):</div>
                  <div class="address-name">${order.customer_name}</div>
                  <div>
                    ${shipping?.addressLine || "Address on file"}<br/>
                    ${shipping?.landmark ? `Landmark: ${shipping.landmark}<br/>` : ""}
                    ${shipping?.city || "Mumbai"}, ${shipping?.state || "Maharashtra"} – <strong>${shipping?.pincode || "400001"}</strong><br/>
                    Ph: <strong>${order.customer_phone}</strong>
                  </div>
                </div>
              </div>

              <div class="contents-box">
                <div class="address-heading">PACKAGE CONTENTS:</div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsRows}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="footer-strip">
              <div>
                <div style="font-weight: 800;">PREPAID (ONLINE)</div>
                <div style="color: #666;">Kolibaba Seafood Inc · GST: 27AABCK1234F1Z8</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 13px; font-weight: 900; font-family: monospace;">TOTAL: Rs. ${order.total_amount_inr}</div>
                <div style="color: #666;">Standard 4×6" Thermal Compliant</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      {/* Strict Print CSS for 4x6 Thermal Printers */}
      <style>{`
        @page {
          size: 4in 6in;
          margin: 0;
        }
        @media print {
          html, body {
            width: 4in !important;
            height: 6in !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-courier-label, #printable-courier-label * {
            visibility: visible !important;
          }
          #printable-courier-label {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 4in !important;
            height: 6in !important;
            max-width: 4in !important;
            margin: 0 !important;
            padding: 0.22in !important;
            box-sizing: border-box !important;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: hidden !important;
            z-index: 999999 !important;
          }
        }
      `}</style>

      <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
        {/* Modal Controls (Not printed) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15 print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#e3a157]" />
            <div>
              <h3 className="font-display font-bold text-base text-[#f5edeb]">
                Thermal Shipping Label
              </h3>
              <p className="text-[11px] text-[#dab38c]/70 font-mono">
                Standard 4×6 Inches (101.6×152.4 mm)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectThermalPrint}
              className="px-3.5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Opens in an isolated window formatted exactly for 4×6 inch thermal printers"
            >
              <Printer className="w-4 h-4 text-[#29100b]" />
              <span>Print 4×6" Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4×6 Inch Thermal Container Preview (Aspect ratio 4:6 = 2:3) */}
        <div
          id="printable-courier-label"
          className="bg-white text-black p-4 rounded-xl border-2 border-black font-sans text-xs space-y-2.5 shadow-md mx-auto w-full max-w-[380px] aspect-[4/6] flex flex-col justify-between print:m-0 print:border-none print:shadow-none print:p-0 print:max-w-none print:aspect-auto"
        >
          <div>
            {/* Header Strip */}
            <div className="flex items-start justify-between border-b-2 border-black pb-2">
              <div>
                <div className="font-bold text-sm tracking-tight uppercase font-mono">
                  MATSYAMART · CARGO
                </div>
                <div className="text-[9px] text-gray-700 font-medium">
                  Standard Ambient Coastal Surface
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase font-bold tracking-wider text-gray-600">
                  AWB ROUTING
                </div>
                <div className="font-mono font-bold text-xs text-black">
                  {awbNumber}
                </div>
              </div>
            </div>

            {/* Barcode Mock Visual */}
            <div className="flex flex-col items-center justify-center py-1 border-b border-black">
              <div className="h-8 w-full flex items-center justify-center gap-[2.5px] bg-white px-2">
                {Array.from({ length: 44 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-6 ${
                      idx % 3 === 0
                        ? "w-[3px] bg-black"
                        : idx % 5 === 0
                          ? "w-[1px] bg-black"
                          : "w-[2px] bg-black"
                    }`}
                  />
                ))}
              </div>
              <div className="font-mono text-[9px] tracking-widest font-bold mt-0.5">
                *{order.order_ref}*
              </div>
            </div>

            {/* Sender & Consignee Columns */}
            <div className="grid grid-cols-2 gap-2 border-b-2 border-black py-2">
              {/* FROM */}
              <div className="space-y-0.5 border-r border-gray-400 pr-1.5">
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-gray-600">
                  SHIP FROM (SENDER):
                </div>
                <div className="font-bold text-[11px]">Kolibaba Seafood Inc</div>
                <div className="text-[9px] leading-tight text-gray-700">
                  Bhoomiputra Coastal Unit<br />
                  Versova Jetty No. 1, Gaothan<br />
                  Andheri West, Mumbai – 400061<br />
                  Ph: +91 98201 44512
                </div>
              </div>

              {/* TO */}
              <div className="space-y-0.5 pl-1">
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-gray-600">
                  DELIVER TO (CONSIGNEE):
                </div>
                <div className="font-bold text-[11px]">{order.customer_name}</div>
                <div className="text-[9px] leading-tight text-gray-800">
                  {shipping?.addressLine || "Address on file"}<br />
                  {shipping?.landmark && `Near: ${shipping.landmark}`}<br />
                  {shipping?.city || "Mumbai"}, {shipping?.state || "Maharashtra"} –{" "}
                  <b className="font-mono text-[10px]">{shipping?.pincode || "400001"}</b><br />
                  Ph: <b className="font-mono">{order.customer_phone}</b>
                </div>
              </div>
            </div>

            {/* Package Details / Manifest Grid */}
            <div className="space-y-1 border-b-2 border-black py-1.5 text-[10px]">
              <div className="text-[8.5px] font-bold uppercase tracking-wider text-gray-600">
                PACKAGE CONTENTS:
              </div>
              <table className="w-full text-left text-[9px]">
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
                      <td className="py-0.5 font-medium truncate max-w-[170px]">
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
          </div>

          {/* Bottom Summary & GST Declaration */}
          <div className="flex items-center justify-between text-[9px] pt-1">
            <div>
              <div className="font-bold">PAYMENT: PREPAID (ONLINE)</div>
              <div className="text-[8.5px] text-gray-600">
                Kolibaba Seafood Inc · GST: 27AABCK1234F1Z8
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xs font-mono">
                TOTAL: {formatINR(order.total_amount_inr)}
              </div>
              <div className="text-[8.5px] text-gray-500">
                Standard 4×6" Thermal Format
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 print:hidden text-[11px] text-[#dab38c]/70">
          <span>Standard thermal size: 4×6 in (101.6×152.4 mm)</span>
          <button
            onClick={handleNativePrint}
            className="hover:text-[#e3a157] underline cursor-pointer text-[10.5px]"
          >
            Or use system print dialogue
          </button>
        </div>
      </div>
    </div>
  );
};

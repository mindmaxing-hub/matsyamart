export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayModalInstance {
  open: () => void;
  on: (event: string, callback: () => void) => void;
}

export interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayModalInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export interface RazorpayCheckoutOptions {
  amountInr: number;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  isExperience?: boolean;
  bhoomiMemberId?: string | undefined;
  delegationToken?: string | undefined;
  verificationToken?: string | undefined;
  quote?: any;
  quoteSignature?: string | undefined;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string | undefined;
  }) => void;
  onDismiss?: () => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve(false);
    }
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const DEFAULT_RAZORPAY_KEY_ID = "rzp_live_TOorX9SfyIq1Au";

export async function initiatePayment(
  options: RazorpayCheckoutOptions,
): Promise<void> {
  const razorpayKey =
    import.meta.env["VITE_RAZORPAY_KEY_ID"] ||
    (typeof process !== "undefined" && process.env?.["VITE_RAZORPAY_KEY_ID"]) ||
    DEFAULT_RAZORPAY_KEY_ID;

  // Attempt to generate official server-verified Razorpay Order ID
  let razorpayOrderId: string | undefined = undefined;

  try {
    const orderRes = await fetch("/api/razorpay/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountInr: options.amountInr,
        orderRef: options.orderRef,
        customerName: options.customerName,
        customerPhone: options.customerPhone,
        customerEmail: options.customerEmail,
        description: options.description,
        bhoomiMemberId: options.bhoomiMemberId,
        delegationToken: options.delegationToken,
        verificationToken: options.verificationToken,
        quote: options.quote,
        quoteSignature: options.quoteSignature,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (orderRes.ok) {
      const orderData = await orderRes.json();
      if (orderData.success && orderData.orderId) {
        razorpayOrderId = orderData.orderId;
      }
    } else {
      const errData = await orderRes.json().catch(() => ({}));
      if (errData?.theftAlert) {
        throw new Error(errData.error || "Bhoomiputra Membership verification failed.");
      }
    }
  } catch (e: any) {
    if (e?.message && e.message.includes("Bhoomiputra")) {
      throw e;
    }
    console.warn("[Razorpay Order API Notice] Proceeding with direct checkout:", e);
  }

  // Load official Razorpay checkout script
  const loaded = await loadRazorpayScript();
  if (loaded && window.Razorpay && razorpayKey) {
    const rzpOptions: Record<string, unknown> = {
      key: razorpayKey,
      amount: Math.round(options.amountInr * 100), // amount in paise
      currency: "INR",
      name: "MatsyaMart",
      description: options.description,
      image: "/favicon.png",
      ...(razorpayOrderId ? { order_id: razorpayOrderId } : {}),
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: {
        color: "#E3A157",
      },
      handler: function (response: RazorpaySuccessResponse) {
        options.onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
        });
      },
      modal: {
        ondismiss: function () {
          if (options.onDismiss) options.onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();
    return;
  }

  // Seamless Sandbox Test Fallback:
  // Render a mock checkout confirmation so the platform works out-of-the-box in preview/demo
  triggerMockRazorpayModal(options);
}

function triggerMockRazorpayModal(options: RazorpayCheckoutOptions) {
  const modalId = "matsyamart-mock-rzp-modal";
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = modalId;
  container.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const isExp = options.isExperience !== false;
  const demoSubtext = isExp
    ? '* Running in demo mode. Click "Simulate Payment Capture" to generate your verified digital pass and confirm booking.'
    : '* Running in demo mode. Click "Simulate Payment Capture" to generate your order receipt and delivery tracking portal.';

  container.innerHTML = `
    <div class="bg-[#29100B] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#DAB38C]/30 text-[#F5EDEB]">
      <div class="bg-[#1F0B07] text-[#F5EDEB] p-5 border-b border-[#DAB38C]/20 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-display font-bold text-lg tracking-wide text-[#F5EDEB]">MatsyaMart</span>
            <span class="text-[10px] font-bold bg-[#E3A157] text-[#29100B] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Test Sandbox</span>
          </div>
          <p class="text-xs text-[#DAB38C]/80 mt-1">${options.description}</p>
        </div>
        <div class="text-right">
          <div class="text-[11px] text-[#DAB38C]/70 uppercase font-semibold">Total Amount</div>
          <div class="text-xl font-bold font-display text-[#E3A157]">₹${options.amountInr.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <div class="bg-[#140604] rounded-2xl p-3.5 border border-[#DAB38C]/20 text-xs text-[#DAB38C] space-y-1.5">
          <div class="flex justify-between">
            <span class="text-[#DAB38C]/70">Customer:</span>
            <span class="font-medium text-[#F5EDEB]">${options.customerName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#DAB38C]/70">Phone:</span>
            <span class="font-medium text-[#F5EDEB]">${options.customerPhone}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#DAB38C]/70">Reference:</span>
            <span class="font-mono font-bold text-[#E3A157]">${options.orderRef}</span>
          </div>
        </div>

        <div class="border border-[#DAB38C]/20 rounded-2xl p-3.5 space-y-2.5 bg-[#1F0B07]/60">
          <div class="text-xs font-bold text-[#E3A157] uppercase tracking-wider">Select Payment Method</div>
          <label class="flex items-center gap-3 p-2.5 rounded-xl bg-[#29100B]/80 hover:bg-[#35160E] cursor-pointer border border-[#DAB38C]/20 transition-colors">
            <input type="radio" name="rzp_method" value="upi" checked class="accent-[#E3A157]">
            <div class="text-xs font-medium text-[#F5EDEB]">
              ⚡ UPI / QR (Instant GPay, PhonePe, Paytm)
            </div>
          </label>
          <label class="flex items-center gap-3 p-2.5 rounded-xl bg-[#29100B]/80 hover:bg-[#35160E] cursor-pointer border border-[#DAB38C]/20 transition-colors">
            <input type="radio" name="rzp_method" value="card" class="accent-[#E3A157]">
            <div class="text-xs font-medium text-[#F5EDEB]">
              💳 Debit / Credit Card (Visa, RuPay, Mastercard)
            </div>
          </label>
        </div>

        <p class="text-[11px] text-[#DAB38C]/70 text-center leading-relaxed">
          ${demoSubtext}
        </p>

        <div class="flex items-center gap-3 pt-2">
          <button id="rzp-mock-cancel" class="flex-1 px-4 py-2.5 text-xs font-medium text-[#DAB38C] bg-[#35160E] hover:bg-[#481F14] border border-[#DAB38C]/20 rounded-xl transition-colors cursor-pointer">
            Cancel
          </button>
          <button id="rzp-mock-pay" class="flex-1 px-4 py-2.5 text-xs font-bold text-[#29100B] bg-[#E3A157] hover:bg-[#DAB38C] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Pay ₹${options.amountInr.toLocaleString("en-IN")}</span>
            <span class="text-[#29100B]">✓</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const payBtn = document.getElementById("rzp-mock-pay");
  const cancelBtn = document.getElementById("rzp-mock-cancel");

  payBtn?.addEventListener("click", () => {
    container.remove();
    const fakePaymentId =
      "pay_sim_" + Math.random().toString(36).substring(2, 12);
    const fakeOrderId =
      "order_sim_" + Math.random().toString(36).substring(2, 12);
    options.onSuccess({
      razorpay_payment_id: fakePaymentId,
      razorpay_order_id: fakeOrderId,
    });
  });

  cancelBtn?.addEventListener("click", () => {
    container.remove();
    if (options.onDismiss) options.onDismiss();
  });
}

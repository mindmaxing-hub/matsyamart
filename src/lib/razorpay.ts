declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayCheckoutOptions {
  amountInr: number;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id?: string }) => void;
  onDismiss?: () => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiatePayment(options: RazorpayCheckoutOptions): Promise<void> {
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // If live key is provided, use actual Razorpay modal
  if (razorpayKey) {
    const loaded = await loadRazorpayScript();
    if (loaded && window.Razorpay) {
      const rzpOptions = {
        key: razorpayKey,
        amount: Math.round(options.amountInr * 100), // amount in paise
        currency: 'INR',
        name: 'MatsyaMart',
        description: options.description,
        image: 'https://experience.bhoomiputra.org/favicon.svg',
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
          contact: options.customerPhone,
        },
        theme: {
          color: '#004A63',
        },
        handler: function (response: any) {
          options.onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
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
  }

  // Seamless Sandbox Test Fallback:
  // Render a mock checkout confirmation so the platform works out-of-the-box in preview/demo
  triggerMockRazorpayModal(options);
}

function triggerMockRazorpayModal(options: RazorpayCheckoutOptions) {
  const modalId = 'matsyamart-mock-rzp-modal';
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = modalId;
  container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in';
  
  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-modal w-full max-w-md overflow-hidden border border-slate-200">
      <div class="bg-ocean-900 text-white p-5 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-display font-bold text-lg tracking-wide">MatsyaMart</span>
            <span class="text-[10px] font-semibold bg-sun-300 text-ocean-950 px-2 py-0.5 rounded-full uppercase">Test Sandbox</span>
          </div>
          <p class="text-xs text-ocean-200 mt-1">${options.description}</p>
        </div>
        <div class="text-right">
          <div class="text-xs text-ocean-200">Amount</div>
          <div class="text-xl font-bold font-display text-sun-300">₹${options.amountInr.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <div class="bg-ocean-50 rounded-xl p-3 border border-ocean-100 text-xs text-ocean-900 space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-500">Customer:</span>
            <span class="font-medium">${options.customerName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Phone:</span>
            <span class="font-medium">${options.customerPhone}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Reference:</span>
            <span class="font-mono font-medium">${options.orderRef}</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-xl p-3 space-y-2">
          <div class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Select Payment Simulation Method</div>
          <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100">
            <input type="radio" name="rzp_method" value="upi" checked class="text-ocean-700 focus:ring-ocean-500">
            <div class="text-xs font-medium text-slate-800">
              ⚡ UPI / QR (Instant GPay, PhonePe, Paytm)
            </div>
          </label>
          <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100">
            <input type="radio" name="rzp_method" value="card" class="text-ocean-700 focus:ring-ocean-500">
            <div class="text-xs font-medium text-slate-800">
              💳 Debit / Credit Card (Visa, RuPay, Mastercard)
            </div>
          </label>
        </div>

        <p class="text-[11px] text-slate-500 text-center leading-relaxed">
          * Running in demo mode. Click "Simulate Payment Capture" to generate your verified digital pass and confirm booking.
        </p>

        <div class="flex items-center gap-3 pt-2">
          <button id="rzp-mock-cancel" class="flex-1 px-4 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button id="rzp-mock-pay" class="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-ocean-800 hover:bg-ocean-900 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
            <span>Pay ₹${options.amountInr.toLocaleString('en-IN')}</span>
            <span class="text-sun-300">✓</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const payBtn = document.getElementById('rzp-mock-pay');
  const cancelBtn = document.getElementById('rzp-mock-cancel');

  payBtn?.addEventListener('click', () => {
    container.remove();
    const fakePaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 12);
    const fakeOrderId = 'order_sim_' + Math.random().toString(36).substring(2, 12);
    options.onSuccess({
      razorpay_payment_id: fakePaymentId,
      razorpay_order_id: fakeOrderId,
    });
  });

  cancelBtn?.addEventListener('click', () => {
    container.remove();
    if (options.onDismiss) options.onDismiss();
  });
}

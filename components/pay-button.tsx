"use client";

import { useState, useCallback } from "react";
import Script from "next/script";
import {
  createRazorpayOrder,
  verifyAndCompletePayment,
} from "@/actions/payment";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: { orderId: string; userId: string };
  config: {
    display: {
      blocks: {
        upi: {
          name: string;
          instruments: Array<{ method: string }>;
        };
      };
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
}

const UPI_ONLY_CHECKOUT_CONFIG: RazorpayOptions["config"] = {
  display: {
    blocks: {
      upi: {
        name: "Pay via UPI",
        instruments: [{ method: "upi" }],
      },
    },
    sequence: ["block.upi"],
    preferences: {
      show_default_blocks: false,
    },
  },
};

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

type PayButtonProps = {
  token: string;
  pendingAmount: number;
  disabled?: boolean;
};

export function PayButton({ token, pendingAmount, disabled }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const handlePay = useCallback(async () => {
    if (!scriptReady || disabled || loading) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await createRazorpayOrder({ token });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const options: RazorpayOptions = {
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: "Allahabad Organic Agricultural Company",
        description: `Order ${result.orderId}`,
        order_id: result.razorpayOrderId,
        prefill: {
          name: result.customerName,
          email: result.customerEmail,
          contact: result.customerPhone,
        },
        notes: {
          orderId: result.orderId,
          userId: result.userId,
        },
        config: UPI_ONLY_CHECKOUT_CONFIG,
        theme: { color: "#168e2d" },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response) => {
          const verify = await verifyAndCompletePayment({
            token,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verify.success) {
            setMessage(verify.message);
            window.location.reload();
          } else {
            setError(verify.error);
          }
          setLoading(false);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => {
        setError(res.error.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch {
      setError("Unable to start payment");
      setLoading(false);
    }
  }, [token, scriptReady, disabled, loading]);

  const formattedPending = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(pendingAmount);

  return (
  <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
      />

      <div className="space-y-3">
        <button
          type="button"
          onClick={handlePay}
          disabled={disabled || loading || !scriptReady}
          className="w-full rounded-xl bg-slate-900 px-6 py-4 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processing…" : `Pay ${formattedPending} with UPI`}
        </button>

        {message ? (
          <p className="text-center text-sm text-emerald-600">{message}</p>
        ) : null}
        {error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : null}
      </div>
    </>
  );
}

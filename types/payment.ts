export type CreateRazorpayOrderResult =
  | {
      success: true;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      keyId: string;
      orderId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
    }
  | {
      success: false;
      error: string;
    };

export type VerifyPaymentResult =
  | { success: true; message: string }
  | { success: false; error: string };

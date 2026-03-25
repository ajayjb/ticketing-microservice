"use client";

import { use, useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import CheckoutForm from "@/features/checkoutForm";
import { PaymentsService } from "@/services/paymentsService";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PageProps) {
  const { id } = use(params);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const createPaymentIntent = async () => {
      const { clientSecret } = await PaymentsService.createPaymentIntent({
        orderId: id,
      });

      setClientSecret(clientSecret);
    };

    createPaymentIntent();
  }, []);

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-500">Preparing secure payment...</p>
      </div>
    );
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm id={id} />
    </Elements>
  );
}

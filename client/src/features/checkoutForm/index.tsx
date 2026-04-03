import { Button } from "@/components/ui/button";
import { sanitizedConfig } from "@/config/config";
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";

interface IProps {
  id: string;
}

export default function CheckoutForm({ id }: IProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${sanitizedConfig.NEXT_PUBLIC_DOMAIN}/orders/${id}/payments/success`,
      },
      redirect: "always",
    });

    if (result.error) {
      setMessage(result.error.message || "Payment failed");
    } else {
      setMessage("Payment successful!");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md max-w-100 mx-auto shadow-sm mb-10">
      <AddressElement options={{ mode: "billing" }} />
      <PaymentElement />
      <Button
        onClick={handlePayment}
        disabled={!stripe || loading}
        className="w-full cursor-pointer mt-4"
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>
      {message && <div className="mt-4">{message}</div>}
    </div>
  );
}

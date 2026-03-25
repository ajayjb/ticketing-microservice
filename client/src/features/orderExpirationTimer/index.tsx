"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCountDown from "@/hooks/useCountDown";
import { Order } from "@/types/order";
import React, { useEffect } from "react";

interface IProps {
  canPay: boolean;
  order: Order;
}

const OrderExpirationTimer = ({ canPay, order }: IProps) => {
  const timeRemaining = useCountDown({ expiresAt: order.expiresAt });

  useEffect(() => {
    if (timeRemaining?.minutes < 0) {
      window.location.reload();
    }
  }, [timeRemaining]);

  return (
    <div>
      {canPay && timeRemaining && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700">
              Reserve expires in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold text-amber-700">
              {String(timeRemaining.minutes).padStart(2, "0")}:
              {String(timeRemaining.seconds).padStart(2, "0")}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Complete payment before the timer runs out.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderExpirationTimer;

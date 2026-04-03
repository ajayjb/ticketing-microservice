"use client";

import { ROUTES } from "@/constants/routes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/order";
import useCountDown from "@/hooks/useCountDown";

interface IProps {
  order: Order;
}

const OrderCard = ({ order }: IProps) => {
  const timeRemaining = useCountDown({ expiresAt: order.expiresAt });

  const isCompleted = order.status === OrderStatus.Complete;
  const isCancelled = order.status === OrderStatus.Cancelled;

  const getStatusBadge = () => {
    switch (order.status) {
      case OrderStatus.Complete:
        return {
          label: "Completed",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case OrderStatus.Cancelled:
        return {
          label: "Cancelled",
          className: "bg-red-50 text-red-600 border-red-200",
        };
      case OrderStatus.AwaitingPayment:
        return {
          label: "Awaiting Payment",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case OrderStatus.Created:
      default:
        return {
          label: "Created",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <Card
      key={order.id}
      className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border bg-white/80 backdrop-blur"
    >
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate text-base font-semibold group-hover:text-primary transition-colors">
              {order.ticket.name}
            </CardTitle>

            <CardDescription className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
              #{order.ticket.slug}
            </CardDescription>
          </div>

          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full border ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="py-3 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-3xl font-bold tracking-tight">
            ₹{order.ticket.price.toLocaleString("en-IN")}
          </p>
        </div>

        {order.status === OrderStatus.AwaitingPayment && timeRemaining && (
          <div className="rounded-lg p-3 flex items-center justify-between bg-amber-50 border border-amber-200">
            <div className="flex flex-col">
              <span className="text-[11px] text-amber-600 font-medium">
                Payment expires in
              </span>
            </div>

            <div className="text-lg font-mono font-bold text-amber-700 tracking-widest">
              {String(timeRemaining.minutes)?.padStart(2, "0")}:
              {String(timeRemaining.seconds)?.padStart(2, "0")}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t mt-auto pt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        {!isCancelled ? (
          <Link href={ROUTES.ORDERS(order.id)}>
            <Button
              size="sm"
              className="cursor-pointer shrink-0 group-hover:scale-105 transition-transform"
            >
              {isCompleted ? "View" : "Pay Now"}
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            disabled
            className="cursor-not-allowed shrink-0 opacity-70"
          >
            Cancelled
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrderCard;

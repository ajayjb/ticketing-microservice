import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { OrdersService } from "@/services/ordersService";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import OrderExpirationTimer from "@/features/orderExpirationTimer";

interface PageProps {
  params: { id: string };
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  created: {
    label: "Pending Payment",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  complete: {
    label: "Complete",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  "awaiting:payment": {
    label: "Awaiting Payment",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const OrderDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const auth = await checkAuth();

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  const order = await OrdersService.findById(id);

  if (!order) {
    notFound();
  }

  const status = statusConfig[order.status] ?? {
    label: order.status,
    className: "bg-muted text-muted-foreground border-border",
  };

  const isExpired = new Date(order.expiresAt).getTime() < Date.now();
  const isCancelled = order.status === "cancelled";
  const isComplete = order.status === "complete";
  const canPay = !isCancelled && !isComplete && !isExpired;

  return (
    <div className="min-h-screen bg-muted/40 p-6 md:p-10">
      <div className="mb-8">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Tickets
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Order Summary
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-mono">
              {order.id}
            </p>
          </div>
          <span
            className={`mt-1 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border shrink-0 ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>
                Information about the ticket in this order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Ticket Name
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {order.ticket.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Slug
                  </dt>
                  <dd className="text-sm font-mono text-foreground">
                    {order.ticket.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Ticket ID
                  </dt>
                  <dd className="text-sm font-mono text-foreground">
                    {order.ticket.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Ticket Created
                  </dt>
                  <dd className="text-sm text-foreground">
                    {new Date(order.ticket.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Metadata and timeline for this order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Order ID
                  </dt>
                  <dd className="text-sm font-mono text-foreground">
                    {order.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    User ID
                  </dt>
                  <dd className="text-sm font-mono text-foreground">
                    {order.userId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Created
                  </dt>
                  <dd className="text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Expires At
                  </dt>
                  <dd
                    className={`text-sm font-mono ${
                      isExpired ? "text-red-600" : "text-foreground"
                    }`}
                  >
                    {new Date(order.expiresAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isExpired && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-red-500">
                        Expired
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {isCancelled && (
            <Card className="border-red-200 bg-red-50/40">
              <CardHeader>
                <CardTitle className="text-red-700">Order Cancelled</CardTitle>
                <CardDescription>
                  This order has been cancelled and the ticket is no longer
                  reserved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  If you still want this ticket, please go back and book it
                  again.
                </p>
              </CardContent>
            </Card>
          )}

          {!isCancelled && isExpired && (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardHeader>
                <CardTitle className="text-amber-700">Order Expired</CardTitle>
                <CardDescription>
                  The payment window for this order has closed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700">
                  This order expired on &nbsp;
                  {new Date(order.expiresAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  . Please book a new ticket to proceed.
                </p>
              </CardContent>
            </Card>
          )}

          {isComplete && (
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardHeader>
                <CardTitle className="text-emerald-700">
                  Payment Complete
                </CardTitle>
                <CardDescription>
                  Your ticket has been successfully booked.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-700">
                  Enjoy &nbsp;
                  <span className="font-semibold">{order.ticket.name}</span>!
                  Your order &nbsp;
                  <span className="font-mono font-semibold">{order.id}</span> is
                  confirmed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-tight">
                ₹{order.ticket.price.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>

          <OrderExpirationTimer canPay={canPay} order={order} />

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {canPay && (
                <Link href={`/orders/${order.id}/payments`}>
                  <Button className="w-full cursor-pointer">Complete Payment</Button>
                </Link>
              )}
              <Button variant="outline" asChild>
                <Link href={ROUTES.HOME}>Back to Tickets</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

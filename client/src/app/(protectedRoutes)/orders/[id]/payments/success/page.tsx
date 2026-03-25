import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { OrdersService } from "@/services/ordersService";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: { id: string };
}

const PaymentSuccessPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const auth = await checkAuth();

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  const order = await OrdersService.findById(id);

  return (
    <div className="min-h-screen bg-muted/40 p-6 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col items-center text-center gap-3 mb-2">
          <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Payment Successful
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your ticket is confirmed and ready to use.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Receipt</CardTitle>
            <CardDescription>
              Summary of your completed booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Event
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {order.ticket.name}
                </dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Order ID
                </dt>
                <dd className="text-sm font-mono text-foreground">
                  {order.id}
                </dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Date
                </dt>
                <dd className="text-sm text-foreground">
                  {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Status
                </dt>
                <dd>
                  <span className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Paid
                  </span>
                </dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Total Paid
                </dt>
                <dd className="text-2xl font-semibold tracking-tight text-foreground">
                  ₹{order.ticket.price.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href={ROUTES.HOME}>Browse More Tickets</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/orders/${order.id}`}>View Order Details</Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Confirmation recorded for order &nbsp;
          <span className="font-mono">{order.id}</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

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
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
            <div className="relative h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <svg
                width="28"
                height="28"
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
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Payment Successful
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Your ticket has been confirmed. A receipt is available below.
            </p>
          </div>
        </div>

        <Card className="shadow-lg border bg-white/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Order Receipt</CardTitle>
            <CardDescription>Summary of your booking</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Event
                </p>
                <p className="text-sm font-medium mt-1">{order.ticket.name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Order ID
              </p>
              <p className="text-sm font-mono">#{order.id}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Date
              </p>
              <p className="text-sm">
                {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Status
              </p>
              <span className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Paid
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm font-medium">Total Paid</p>
              <p className="text-2xl font-bold tracking-tight">
                ₹{order.ticket.price.toLocaleString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            asChild
            className="w-full h-11 text-sm font-medium shadow-sm hover:shadow-md transition"
          >
            <Link href={ROUTES.HOME}>Browse More Tickets</Link>
          </Button>

          <Button variant="outline" asChild className="w-full h-11 text-sm">
            <Link href={`/orders/${order.id}`}>View Order Details</Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Confirmation for&nbsp;
          <span className="font-mono">#{order.id}</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

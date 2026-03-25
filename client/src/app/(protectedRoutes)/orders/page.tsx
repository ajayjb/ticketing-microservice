import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrdersService } from "@/services/ordersService";
import { Order, OrderStatus } from "@/types/order";
import OrderCard from "@/features/orderCard";

const Orders = async () => {
  const auth = await checkAuth();

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  const orders = await OrdersService.fetchUserOrders();

  const completed = orders.filter(
    (ticket) => ticket.status === OrderStatus.Complete
  );
  const awaitingPayment = orders.filter(
    (ticket) => ticket.status === OrderStatus.AwaitingPayment
  );
  const cancelled = orders.filter(
    (ticket) => ticket.status === OrderStatus.Cancelled
  );

  return (
    <div className="min-h-screen bg-muted/40 p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and monitor all your orders.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Booked
            </p>
            <p className="text-3xl font-semibold text-emerald-600">
              {completed.length}
            </p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Awaiting Payment
            </p>
            <p className="text-3xl font-semibold text-yellow-600">
              {awaitingPayment.length}
            </p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Cancelled
            </p>
            <p className="text-3xl font-semibold text-red-500">
              {cancelled.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {orders.map((order: Order) => (
          <OrderCard order={order} key={order.id} />
        ))}
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-muted-foreground text-sm">No orders found.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;

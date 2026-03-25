import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { TicketsService } from "@/services/ticketsService";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import CreateOrderButton from "@/features/createOrderButton";
import Link from "next/link";

interface PageProps {
  params: { slug: string };
}

const TicketDetailPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const auth = await checkAuth();

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  const ticket = await TicketsService.findOne(slug);

  if (!ticket) {
    notFound();
  }

  const isBooked = !!ticket.orderId;

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
              {ticket.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-mono">
              {ticket.slug}
            </p>
          </div>
          <span
            className={`mt-1 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border shrink-0 ${
              isBooked
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isBooked ? "Booked" : "Available"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>
                Core information about this ticket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Ticket ID
                  </dt>
                  <dd className="text-sm font-mono text-foreground">
                    {ticket.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Slug
                  </dt>
                  <dd className="text-sm font-mono text-foreground">
                    {ticket.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Created
                  </dt>
                  <dd className="text-sm text-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Order ID
                  </dt>
                  <dd className="text-sm font-mono text-foreground">
                    {ticket.orderId ?? (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {isBooked && (
            <Card className="border-red-200 bg-red-50/40">
              <CardHeader>
                <CardTitle className="text-red-700">Booked</CardTitle>
                <CardDescription>
                  This ticket is currently assigned to an order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  Order{" "}
                  <span className="font-mono font-semibold">
                    {ticket.orderId}
                  </span>{" "}
                  holds this ticket. Cancel the order before making changes.
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
                ₹{ticket.price.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {!isBooked && <CreateOrderButton ticketId={ticket.id} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;

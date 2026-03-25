import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { TicketsService } from "@/services/ticketsService";
import { Ticket } from "@/types/ticket";
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

const Home = async () => {
  const auth = await checkAuth();

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  const tickets = await TicketsService.fetchTickets();

  const available = tickets.filter((t: Ticket) => !t.orderId).length;
  const booked = tickets.filter((t: Ticket) => !!t.orderId).length;

  return (
    <div className="min-h-screen bg-muted/40 p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and monitor all your event tickets.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Total
            </p>
            <p className="text-3xl font-semibold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Available
            </p>
            <p className="text-3xl font-semibold text-emerald-600">
              {available}
            </p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Booked
            </p>
            <p className="text-3xl font-semibold text-red-500">{booked}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tickets.map((ticket: Ticket) => {
          const isBooked = !!ticket.orderId;

          return (
            <Card
              key={ticket.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader>
                <CardTitle>{ticket.name}</CardTitle>
                <CardDescription className="font-mono text-xs">
                  {ticket.slug}
                </CardDescription>
                <CardAction>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      isBooked
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isBooked ? "Booked" : "Available"}
                  </span>
                </CardAction>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-semibold">
                  ₹{ticket.price.toLocaleString("en-IN")}
                </p>
              </CardContent>

              <CardFooter className="border-t pt-4 mt-auto flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Created &nbsp;
                  {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {!isBooked ? (
                  <Link href={ROUTES.TICKETS(ticket.slug)}>
                    <Button className="cursor-pointer">Book Now</Button>
                  </Link>
                ) : (
                  <Link href={ROUTES.TICKETS(ticket.slug)}>
                    <Button className="cursor-pointer">View Ticket</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-muted-foreground text-sm">No tickets found.</p>
        </div>
      )}
    </div>
  );
};

export default Home;

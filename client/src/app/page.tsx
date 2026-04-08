import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { TicketsService } from "@/services/ticketsService";
import { Ticket } from "@/types/ticket";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import TicketCard from "@/features/ticketCard";

const Home = async () => {
  const auth = await checkAuth();

  console.log("authauthauth", auth)

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  const tickets = await TicketsService.fetchTickets();
  const availabelTickets = tickets.filter((ticket) => !ticket.orderId);

  const available = availabelTickets.length;
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
        {availabelTickets.map((ticket: Ticket) => (
          <TicketCard ticket={ticket} key={ticket.id} />
        ))}
      </div>

      {availabelTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-muted-foreground text-sm">No tickets found.</p>
        </div>
      )}
    </div>
  );
};

export default Home;

import { ROUTES } from "@/constants/routes";
import { Ticket } from "@/types/ticket";
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

interface IProps {
  ticket: Ticket;
}

const TicketCard = ({ ticket }: IProps) => {
  const isBooked = !!ticket.orderId;

  return (
    <Card
      key={ticket.id}
      className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
            timeZone: "Asia/Kolkata",
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
};

export default TicketCard;

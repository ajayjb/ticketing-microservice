import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import NewTicketForm from "@/features/newTicketForm";

const NewTicket = async () => {
  const auth = await checkAuth();

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)]">
      <NewTicketForm />
    </div>
  );
};

export default NewTicket;

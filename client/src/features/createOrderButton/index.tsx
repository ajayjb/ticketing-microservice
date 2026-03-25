"use client";

import Errors from "@/components/errors";
import { Button } from "@/components/ui/button";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { ROUTES } from "@/constants/routes";
import useRequest from "@/hooks/useRequest";
import { RequestMethod } from "@/types/api";
import { Order } from "@/types/order";
import { useRouter } from "next/navigation";

interface IProps {
  ticketId: string;
}

const CreateOrderButton = (props: IProps) => {
  const router = useRouter();
  const { isLoading, error, isError, request } = useRequest({
    onSuccess: (data: unknown) => {
      router.push(ROUTES.ORDERS((data as { data: Order }).data.id));
    },
  });

  const handleCreateOrder = async (data: { ticketId: string }) => {
    request({
      url: API_ENDPOINT.ORDERS.CREATE,
      method: RequestMethod.POST,
      data,
    });
  };

  return (
    <>
      <Button
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background text-sm font-medium px-4 py-2.5 hover:bg-foreground/90 transition-colors cursor-pointer"
        onClick={() =>
          handleCreateOrder({
            ticketId: props.ticketId,
          })
        }
        disabled={isLoading}
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
          <path d="M20 12V22H4V12" />
          <path d="M22 7H2v5h20V7z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
        {isLoading ? "Creating Order..." : "Book Ticket"}
      </Button>

      <Errors isError={isError} error={error} />
    </>
  );
};

export default CreateOrderButton;

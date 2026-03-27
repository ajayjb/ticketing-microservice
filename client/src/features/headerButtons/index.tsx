"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { ROUTES } from "@/constants/routes";
import useRequest from "@/hooks/useRequest";
import { RequestMethod } from "@/types/api";

interface IProps {
  isLoggedIn: boolean;
}

const HeaderButtons = (props: IProps) => {
  const { isLoggedIn } = props;
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, request } = useRequest({
    onSuccess: () => {
      router.refresh();
    },
  });

  const onClick = async () => {
    request({
      url: API_ENDPOINT.USER.SIGNOUT,
      method: RequestMethod.POST,
    });
  };

  return (
    <div className="flex justify-between items-center gap-5">
      {isLoggedIn && (
        <>
          <Link href="/tickets/new">Sell Tickets</Link>
          <Link href="/orders">My Orders</Link>
        </>
      )}

      {!isLoggedIn && (
        <>
          {pathname === ROUTES.SIGNIN && (
            <Link href={ROUTES.SIGNUP}>
              <Button
                type="button"
                variant="outline"
                className="w-fit cursor-pointer"
              >
                Sign Up
              </Button>
            </Link>
          )}
          {pathname === ROUTES.SIGNUP && (
            <Link href={ROUTES.SIGNIN}>
              <Button
                type="button"
                variant="outline"
                className="w-fit cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
          )}
        </>
      )}

      {isLoggedIn && (
        <Button
          type="button"
          variant="outline"
          className="w-fit cursor-pointer"
          disabled={isLoading}
          onClick={onClick}
        >
          {isLoading ? "Signing out..." : "Sign Out"}
        </Button>
      )}
    </div>
  );
};

export default HeaderButtons;

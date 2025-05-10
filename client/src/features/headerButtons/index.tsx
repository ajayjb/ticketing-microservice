"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { ROUTES } from "@/constants/routes";
import useRequest, { RequestMethod } from "@/hooks/useRequest";

const HeaderButtons = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, request } = useRequest({
    onSuccess: () => {
      router.push(ROUTES.SIGNIN);
    },
  });

  const onClick = async () => {
    request({
      url: API_ENDPOINT.USER.SIGNOUT,
      method: RequestMethod.POST,
    });
  };

  return (
    <>
      <div>
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
      </div>
      <div>
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
      </div>
      {pathname === ROUTES.HOME && (
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
    </>
  );
};

export default HeaderButtons;

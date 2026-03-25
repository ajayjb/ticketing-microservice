"use client";

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useRequest from "@/hooks/useRequest";
import Errors from "@/components/errors";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { ROUTES } from "@/constants/routes";
import { RequestMethod } from "@/types/api";

type IFormInput = {
  name: string;
  price: number;
};

const NewTicketForm = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<IFormInput>();
  const { isLoading, error, isError, request } = useRequest({
    onSuccess: () => {
      router.push(ROUTES.HOME);
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    request({
      url: API_ENDPOINT.TICKETS.CREATE,
      method: RequestMethod.POST,
      data: {
        ...data,
        price: Number(data.price),
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create Ticket</CardTitle>
        <CardDescription>Fill in the details for your new ticket</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Errors isError={isError} error={error} />

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Wick"
              {...register("name", { required: true })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price *
            </label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              {...register("price", { required: true, min: 0 })}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewTicketForm;

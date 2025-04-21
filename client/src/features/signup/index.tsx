"use client";

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Errors from "@/components/errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { ROUTES } from "@/constants/routes";
import useRequest, { RequestMethod } from "@/hooks/useRequest";

type IFormInput = {
  firstName: string;
  middleName?: string;
  lastName?: string;
  email: string;
  password: string;
};

const Signup = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<IFormInput>();
  const { isLoading, error, isError, request } = useRequest({
    onSuccess: () => {
      router.push(ROUTES.HOME);
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    request({
      url: API_ENDPOINT.USER.SIGNUP,
      method: RequestMethod.POST,
      data,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Create an account to start using our services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Errors isError={isError} error={error} />
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name *
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              {...register("firstName", { required: true, maxLength: 80 })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="middleName" className="text-sm font-medium">
              Middle Name
            </label>
            <Input
              id="middleName"
              type="text"
              placeholder="Middle name"
              {...register("middleName", { required: false, maxLength: 100 })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              {...register("lastName", { required: false, maxLength: 100 })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: true,
                pattern: /^\S+@\S+$/i,
              })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password *
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", { required: true })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Have an account?{" "}
          <a href="/signin" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Signup;

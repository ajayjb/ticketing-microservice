"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useRequest, { RequestMethod } from "@/hooks/useRequest";
import Errors from "@/components/errors";
import { ROUTES } from "@/constants/routes";

type IFormInput = {
  email: string;
  password: string;
};

const Signin = () => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<IFormInput>();
  const { isLoading, error, isError, request } = useRequest({
    onSuccess: () => {
      router.push(ROUTES.HOME);
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    request({
      url: "/api/auth/v1/user/signin",
      method: RequestMethod.POST,
      data,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Errors isError={isError} error={error} />

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Signin;

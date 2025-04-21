import api from "@/lib/axios";
import { ErrorMessage } from "@/types/apiError";
import { AxiosError } from "axios";
import { isEmpty } from "lodash";
import React from "react";

export enum RequestMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

interface RequestParams {
  url: string;
  method: RequestMethod;
  data?: object;
  headers?: Record<string, string>;
}

interface RequestProps {
  onSuccess?: (data?: unknown) => void;
  onError?: (data?: unknown) => void;
  onFinally?: (data?: unknown) => void;
}

const useRequest = (props: RequestProps) => {
  const { onSuccess, onError, onFinally } = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<ErrorMessage[]>([]);
  const [isError, setIsError] = React.useState<boolean>(false);

  const request = async ({ url, method, data, headers }: RequestParams) => {
    try {
      setIsLoading(true);
      setError([]);
      const options: RequestParams = {
        url,
        method,
      };

      if (data) {
        options.data = data;
      }
      if (headers) {
        options.headers = headers;
      }

      const res = await api[method](url, data);
      setIsError(false);
      onSuccess?.(res.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        if (!isEmpty(err.response?.data.errors)) {
          setError(err.response?.data.errors);
        } else {
          setError([{ message: [err.response?.data?.message] }]);
        }
      }
      setIsError(true);
      onError?.(err);
    } finally {
      onFinally?.();
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    isError,
    request,
  };
};

export default useRequest;

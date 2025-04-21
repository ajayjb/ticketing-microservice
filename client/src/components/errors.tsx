import { ErrorMessage } from "@/types/apiError";
import { formatErrorMessage } from "@/utils/formatErrorMessage";
import React from "react";

interface ErrorsProps {
  isError: boolean;
  error: ErrorMessage[];
}

const Errors = ({ isError = false, error }: ErrorsProps) => {
  return (
    <div className="space-y-2">
      {isError &&
        error
          .map((item) => formatErrorMessage(item))
          .map((item, index) => (
            <li
              key={index}
              className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm"
            >
              <strong>{item.label}</strong>:&nbsp;
              {item.message}
            </li>
          ))}
    </div>
  );
};

export default Errors;

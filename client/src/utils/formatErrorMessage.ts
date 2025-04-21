import { formLabels } from "@/constants/formLabels";
import { ErrorMessage } from "@/types/apiError";

export const formatErrorMessage = (error: ErrorMessage) => {
  const message = error.message;

  const updatedMessages = message.map((msg) => {
    const updatedMsg = msg.replace(/^String\s/, "").replace(/^Number\s/, "");
    return updatedMsg.charAt(0).toUpperCase() + updatedMsg.slice(1);
  });

  return {
    label: error.field ? formLabels[error.field] : "",
    message: updatedMessages.join(", "),
  };
};

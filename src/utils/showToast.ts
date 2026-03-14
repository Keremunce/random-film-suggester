import { toast } from "sonner";

export const showToast = (message: string, variant: "default" | "warning" = "default") => {
  if (variant === "warning") {
    toast.warning(message);
    return;
  }
  toast(message);
};

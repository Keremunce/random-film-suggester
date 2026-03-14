"use client";

import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => {
  return (
    <>
      <SonnerToaster
        position="bottom-right"
        className="sonner-desktop"
        richColors={false}
      />
      <SonnerToaster
        position="top-center"
        className="sonner-mobile"
        richColors={false}
      />
    </>
  );
};

"use client";

import React, { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./overlay.module.css";

type DialogContextValue = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => (
  <DialogContext.Provider value={{ open, onOpenChange }}>
    {children}
  </DialogContext.Provider>
);

type DialogContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const DialogContent = ({ children, className }: DialogContentProps) => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("DialogContent must be used within Dialog");
  }

  const { open, onOpenChange } = context;

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={() => onOpenChange?.(false)}>
      <div
        className={`${styles.dialogContent}${className ? ` ${className}` : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

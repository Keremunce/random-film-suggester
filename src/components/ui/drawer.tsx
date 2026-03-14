"use client";

import React, { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./overlay.module.css";

type DrawerContextValue = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

type DrawerProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export const Drawer = ({ open, onOpenChange, children }: DrawerProps) => (
  <DrawerContext.Provider value={{ open, onOpenChange }}>
    {children}
  </DrawerContext.Provider>
);

type DrawerContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const DrawerContent = ({ children, className }: DrawerContentProps) => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("DrawerContent must be used within Drawer");
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
        className={`${styles.drawerContent}${className ? ` ${className}` : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

"use client";

import React, { createContext, useContext } from "react";
import styles from "./select.module.css";

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

export const Select = ({ value, onValueChange, children }: SelectProps) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    {children}
  </SelectContext.Provider>
);

type SelectTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

export const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

type SelectValueProps = {
  placeholder?: string;
};

export const SelectValue = ({ placeholder }: SelectValueProps) => {
  return <span>{placeholder}</span>;
};

type SelectContentProps = {
  children: React.ReactNode;
};

export const SelectContent = ({ children }: SelectContentProps) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("SelectContent must be used within Select");
  }

  return (
    <select
      className={styles.select}
      value={context.value}
      onChange={(event) => context.onValueChange(event.target.value)}
    >
      {children}
    </select>
  );
};

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

export const SelectItem = ({ value, children }: SelectItemProps) => {
  return <option value={value}>{children}</option>;
};

export const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <label className={styles.label}>{children}</label>
);

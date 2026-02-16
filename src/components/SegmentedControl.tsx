"use client";

import React from "react";
import styles from "./SegmentedControl.module.css";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  stretch?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  stretch = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`${styles.segmented} ${stretch ? styles.stretch : ""} ${className ?? ""}`.trim()}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.button} ${
            option.value === value ? styles.active : ""
          }`.trim()}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

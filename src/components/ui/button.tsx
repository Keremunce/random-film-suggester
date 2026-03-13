import React from "react";
import styles from "./button.module.css";

type ButtonVariant = "default" | "outline";

const cn = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  asChild?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, children, ...props }, ref) => {
    const composedClassName = cn(
      styles.button,
      variant === "outline" && styles.outline,
      className
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        className?: string;
        [key: string]: unknown;
      }>;
      return React.cloneElement(child, {
        ...child.props,
        className: cn(child.props?.className, composedClassName),
      });
    }

    return (
      <button ref={ref} className={composedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

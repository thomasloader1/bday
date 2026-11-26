import React, { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the button and swaps the icon slot for an inline spinner (no layout shift). */
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  /** Renders the button styles onto a single child element (e.g. a link). */
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-800",
  secondary:
    "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100",
  ghost: "bg-transparent text-primary-700 hover:bg-primary-50 active:bg-primary-100",
  success: "bg-success text-white hover:bg-success/90 active:bg-success/80",
  danger: "bg-danger text-white hover:bg-danger/90 active:bg-danger/80",
};

/** 44 / 48 / 56px min-height — touch targets >= 44x44. */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-sm",
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-6 text-lg",
};

const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  asChild = false,
  className,
  children,
  disabled,
  type,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[color,background-color,border-color,transform] duration-base ease-party focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 active:scale-95 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {(loading || (icon && iconPosition === "left")) && (
        <span
          className="inline-flex w-5 shrink-0 justify-center"
          aria-hidden="true"
        >
          {loading ? (
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-neutral-200 border-t-primary-600"
              aria-hidden="true"
            />
          ) : (
            icon
          )}
        </span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className="inline-flex w-5 shrink-0 justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  );

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return null;
    }
    return cloneElement(child, {
      ...child.props,
      ...rest,
      className: cn(classes, child.props.className),
      "aria-disabled": isDisabled || undefined,
    });
  }

  return (
    <button type={type ?? "button"} disabled={isDisabled} {...rest} className={classes}>
      {content}
    </button>
  );
};

export default Button;

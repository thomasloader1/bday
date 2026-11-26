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

/** One coral-filled button (primary, and success for "Confirmar") beside a light outlined one (secondary, ghost, danger). */
const filled =
  "rounded-input bg-spot px-6 text-spot-ink hover:bg-spot-deep hover:text-surface active:bg-spot-deep active:text-surface";
const underline =
  "rounded-input border border-rule bg-surface px-5 text-ink hover:bg-paper-2 active:bg-paper-3";

const variantClasses: Record<ButtonVariant, string> = {
  primary: filled,
  success: filled,
  secondary: underline,
  danger: underline,
  ghost: underline,
};

/** 44 / 48 / 52px min-height: touch targets of 44px or more. */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 text-sm",
  md: "min-h-12 text-base",
  lg: "min-h-[3.25rem] text-lg",
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
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold transition-colors duration-fast ease-party disabled:cursor-not-allowed disabled:opacity-55",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {(loading || (icon && iconPosition === "left")) && (
        <span className="inline-flex w-5 shrink-0 justify-center" aria-hidden="true">
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-t-transparent" />
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

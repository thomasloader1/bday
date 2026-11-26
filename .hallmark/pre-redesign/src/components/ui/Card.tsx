import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "default" | "paper" | "elevated";
export type CardElement = "article" | "section" | "div";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  /** Semantic HTML element. Defaults to "article" for content cards, "section" for layout. */
  as?: CardElement;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-card-default",
  paper: "bg-card-paper",
  elevated: "bg-card-elevated shadow-md",
};

const Card = forwardRef<HTMLElement, CardProps>(
  ({ variant = "default", as = "article", className, children, ...rest }, ref) => {
    const Component = as;
    return (
      <Component
        ref={ref as React.Ref<any>}
        className={cn(
          "rounded-xl border border-neutral-200 p-6",
          variantClasses[variant],
          className
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";

export default Card;
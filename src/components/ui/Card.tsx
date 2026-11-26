import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "default" | "paper" | "elevated";
export type CardElement = "article" | "section" | "div";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  /** Semantic HTML element. Defaults to "article" for content cards, "section" for layout. */
  as?: CardElement;
}

/** Light card: warm-white surface, 20px radius, a hairline and one soft shadow. */
const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface",
  paper: "bg-surface",
  elevated: "bg-surface",
};

const Card = forwardRef<HTMLElement, CardProps>(
  ({ variant = "default", as = "article", className, children, ...rest }, ref) => {
    const Component = as;
    return (
      <Component
        ref={ref as React.Ref<any>}
        className={cn("rounded-card border border-rule p-6 shadow-card md:p-8", variantClasses[variant], className)}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";

export default Card;

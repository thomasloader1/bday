import React from "react";
import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "paper" | "elevated";
}

const variantClasses = {
  default: "bg-white",
  paper: "bg-festive-cream",
  elevated: "bg-white shadow-md",
};

const Card = ({ variant = "default", className, children, ...rest }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 p-6",
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;

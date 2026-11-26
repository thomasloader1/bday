import React from "react";
import { cn } from "@/lib/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  /** Page-level mode: renders the full-viewport flex wrapper. Default (inline) never sizes to the viewport. */
  standalone?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-12 w-12",
};

const LoadingSpinner = ({
  size = "md",
  label = "Cargando",
  standalone = false,
}: LoadingSpinnerProps) => {
  const spinner = (
    <div role="status" className="flex items-center justify-center gap-3">
      <span
        className={cn(
          "inline-block animate-spin rounded-full border-solid border-neutral-200 border-t-primary-600",
          size === "lg" ? "border-4" : "border-2",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className={standalone ? "text-neutral-600" : "sr-only"}>{label}</span>
    </div>
  );

  if (standalone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

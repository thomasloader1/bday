
import React, { FC } from 'react'

interface BadgeProps{
    text: string;
    color?: string;
    className?: string;
}

/**
 * Semantic badge colors, tokenized (CP-9 / design-system Badge mapping):
 * yellow→warning, orange→primary, green→success, dark→neutral, default→info.
 * Text is always a dark neutral (>= 4.5:1 on the tinted backgrounds); the
 * semantic color is carried by the tint + border so contrast stays AA.
 */
const badgeColors: Record<string, string> = {
  warning: "border-warning/60 bg-warning/10 text-neutral-800",
  primary: "border-primary-300 bg-primary-50 text-primary-800",
  success: "border-success/60 bg-success/10 text-neutral-800",
  neutral: "border-neutral-300 bg-neutral-100 text-neutral-700",
  info: "border-info/60 bg-info/10 text-neutral-800",
};

const getColor = (color?: string): string => badgeColors[color || "info"] ?? badgeColors.info;

const Badge: FC<BadgeProps> = ({ text, color, className}) => {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium me-2 ${getColor(color)} ${className || ''}`}>{text}</span>
  )
}

export default Badge

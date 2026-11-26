import React, { FC } from 'react'

interface BadgeProps{
    text: string;
    color?: string;
    className?: string;
}

/** A lime chip. `color` is kept for callers; the palette has one chip colour. */
const Badge: FC<BadgeProps> = ({ text, className}) => {
  return (
    <span className={`inline-flex items-center rounded-full bg-lime px-3 py-1 text-sm font-medium text-lime-ink ${className || ''}`}>{text}</span>
  )
}

export default Badge

import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's default scale, so it reads the theme's
 * own sizes (`text-display`) and rule widths (`border-bar`) as colours and
 * drops them next to `text-ink` / `border-ink`. Register them as what they are.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "display-s", "section", "title", "lead"] }],
      "border-w": [{ border: ["bar", "hair"] }],
      "border-w-t": [{ "border-t": ["bar", "hair"] }],
      "border-w-b": [{ "border-b": ["bar", "hair"] }],
      "border-w-l": [{ "border-l": ["bar", "hair"] }],
      "border-w-r": [{ "border-r": ["bar", "hair"] }],
    },
  },
});

/** Merge Tailwind class names, resolving conflicts (last wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

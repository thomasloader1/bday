"use client";

import React, { FC } from "react";
import { cn } from "@/lib/cn";

export interface ProductCard2Props {
  name: string;
  image: string;
  link: string;
  /** The first card is likely the LCP: load it eagerly at high priority. */
  priority?: boolean;
  /** 1-based position in the catalog, rendered as tabular index. */
  index?: number;
  /** Number of invited guests pitching in on this gift. */
  voteCount?: number;
  /** First names of invited guests who voted for this gift. */
  voters?: string[];
  /** Highest vote count across all gifts, used to scale the momentum bar. */
  maxVotes?: number;
  /** Whether the currently identified guest is pitching in on this gift. */
  voted?: boolean;
  /** Whether this gift leads the vote count (and has at least one vote). */
  isTopVoted?: boolean;
  /** True while a vote request for this gift is in flight. */
  votingBusy?: boolean;
  /** Called when the guest clicks the vote toggle button. */
  onToggleVote?: () => void;
}

const formatVotersLine = (count: number, voters: string[]): string => {
  if (count === 0) return "Nadie se sumó todavía";
  const shown = voters.slice(0, 3);
  const rest = count - shown.length;
  if (rest > 0) {
    return `${shown.join(", ")} y ${rest} más`;
  }
  if (shown.length === 1) return shown[0];
  if (shown.length === 2) return `${shown[0]} y ${shown[1]}`;
  return `${shown[0]}, ${shown[1]} y ${shown[2]}`;
};

/**
 * A wishlist gift card: tinted photo stage with catalog index, gift title,
 * group-gift ("vaquita") participation meter + voters, vote toggle, and buy link.
 */
const ProductCard2: FC<ProductCard2Props> = ({
  name,
  image,
  link,
  priority = false,
  index,
  voteCount = 0,
  voters = [],
  maxVotes = 0,
  voted = false,
  isTopVoted = false,
  votingBusy = false,
  onToggleVote,
}) => {
  const ratio = maxVotes > 0 ? Math.min(1, voteCount / maxVotes) : 0;
  const countLabel =
    voteCount === 0
      ? "Sin aportes aún"
      : voteCount === 1
        ? "1 invitado se suma"
        : `${voteCount} invitados se suman`;

  return (
    <article
      className={cn(
        "group well flex h-full min-w-0 flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-short ease-party hover:-translate-y-1 motion-reduce:hover:translate-y-0",
        voted && "border-spot"
      )}
    >
      {/* Photo stage: warm tinted paper surface, generous breathing room, concentric top corners */}
      <figure className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2 p-6">
        {typeof index === "number" && (
          <span
            aria-hidden="true"
            className="num pointer-events-none absolute left-4 top-4 z-10 text-sm font-medium text-muted"
          >
            {String(index).padStart(2, "0")}
          </span>
        )}
        {isTopVoted && voteCount > 0 && (
          <span className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-lime px-3 py-1 text-xs font-semibold text-lime-ink">
            Más votado
          </span>
        )}
        <img
          className="h-full w-full object-contain mix-blend-multiply"
          src={image}
          alt={name}
          width={600}
          height={450}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </figure>

      {/* Body: title, live participation meter, and action row */}
      <div className="flex flex-1 flex-col gap-5 p-6">
        <h2 className="text-title font-display text-ink">{name}</h2>

        {/* Group-gift voting meter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="num font-medium text-ink">{countLabel}</span>
            {voted && (
              <span className="text-xs font-semibold text-spot-deep">
                Tu elección
              </span>
            )}
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-paper-2"
            aria-hidden="true"
          >
            <div
              className={cn(
                "h-full w-full origin-left rounded-full transition-transform duration-long ease-party",
                voted ? "bg-spot" : isTopVoted ? "bg-lime" : "bg-ink"
              )}
              style={{ transform: `scaleX(${ratio})` }}
            />
          </div>
          <p className="min-h-[1.25rem] text-sm text-ink-2">
            {formatVotersLine(voteCount, voters)}
          </p>
        </div>

        {/* Footer actions: vote toggle + buy link */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
          {onToggleVote && (
            <button
              type="button"
              onClick={onToggleVote}
              disabled={votingBusy}
              aria-pressed={voted}
              aria-busy={votingBusy || undefined}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-input px-4 text-sm font-semibold transition-[background-color,color,border-color,transform] duration-fast ease-party active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0",
                voted
                  ? "bg-lime text-lime-ink hover:bg-spot hover:text-spot-ink"
                  : "bg-spot text-spot-ink hover:bg-spot-deep hover:text-surface"
              )}
            >
              {voted ? (
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 8.5L6.5 11.5L12.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 3.5V12.5M3.5 8H12.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <span>
                {votingBusy
                  ? "Guardando…"
                  : voted
                    ? "Te sumaste"
                    : "Me sumo"}
              </span>
            </button>
          )}

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Comprar ${name}`}
            className="link inline-flex min-h-11 items-center px-1 text-sm font-medium"
          >
            Comprar
          </a>
        </div>
      </div>
    </article>
  );
};

export default ProductCard2;

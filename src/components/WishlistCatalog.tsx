"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ProductCard2 from "@/components/ProductCard2";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { GiftConfig } from "@/lib/config/schema";
import type { WishlistVotesSnapshot } from "@/lib/wishlist/votesStore";

const GUEST_STORAGE_KEY = "bday:guestId";

export interface WishlistItem extends GiftConfig {
  key: string;
}

interface WishlistCatalogProps {
  gifts: WishlistItem[];
  initialSnapshot: WishlistVotesSnapshot;
}

type SortMode = "default" | "popular";

const WishlistCatalog: React.FC<WishlistCatalogProps> = ({ gifts, initialSnapshot }) => {
  const [snapshot, setSnapshot] = useState<WishlistVotesSnapshot>(initialSnapshot);
  const [guestId, setGuestId] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [busyGiftKey, setBusyGiftKey] = useState<string | null>(null);
  const [voteNotice, setVoteNotice] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const phoneInputRef = useRef<HTMLInputElement>(null);

  const loadVotesForGuest = async (candidateId: string, silent = false) => {
    const digits = candidateId.replace(/\D+/g, "");
    if (!digits) {
      if (!silent) setAuthError("Ingresá tu número de teléfono sin espacios.");
      return false;
    }

    setAuthLoading(true);
    if (!silent) setAuthError("");

    try {
      const response = await fetch(`/api/wishlist/votes?guestId=${encodeURIComponent(digits)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as WishlistVotesSnapshot & { error?: string };

      if (!response.ok || !data.guest) {
        if (!silent) {
          setAuthError(data.error || "Ese número no está en la lista de invitados.");
        }
        return false;
      }

      setSnapshot({
        gifts: data.gifts,
        totalVotes: data.totalVotes,
        totalParticipants: data.totalParticipants,
        guest: data.guest,
      });
      setGuestId(digits);
      setPhoneInput("");
      setAuthError("");
      try {
        window.localStorage.setItem(GUEST_STORAGE_KEY, digits);
      } catch {
        // Ignore storage restrictions.
      }
      return true;
    } catch {
      if (!silent) {
        setAuthError("No se pudo verificar tu invitación. Probá de nuevo.");
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Auto-recognize invited guests who already opened their invitation link.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(GUEST_STORAGE_KEY);
      if (saved) {
        void loadVotesForGuest(saved, true);
      }
    } catch {
      // Ignore storage restrictions.
    }
  }, []);

  const handleIdentifySubmit = async (event: FormEvent) => {
    event.preventDefault();
    setVoteNotice("");
    const ok = await loadVotesForGuest(phoneInput, false);
    if (!ok) {
      phoneInputRef.current?.focus();
    }
  };

  const handleSwitchGuest = () => {
    setGuestId("");
    setAuthError("");
    setVoteNotice("");
    setSnapshot((prev) => ({
      ...prev,
      guest: null,
      gifts: Object.fromEntries(
        Object.entries(prev.gifts).map(([k, v]) => [k, { ...v, voted: false }])
      ),
    }));
    try {
      window.localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      // Ignore storage restrictions.
    }
    window.setTimeout(() => phoneInputRef.current?.focus(), 0);
  };

  const handleToggleVote = async (gift: WishlistItem) => {
    if (!snapshot.guest || !guestId) {
      setVoteNotice("Ingresá tu número de invitado arriba para sumarte a un regalo.");
      phoneInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      phoneInputRef.current?.focus();
      return;
    }

    setBusyGiftKey(gift.key);
    setVoteNotice("");

    try {
      const response = await fetch("/api/wishlist/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, giftKey: gift.key }),
      });
      const data = (await response.json()) as WishlistVotesSnapshot & { error?: string };

      if (!response.ok) {
        setVoteNotice(data.error || "No se pudo guardar tu voto. Probá de nuevo.");
        return;
      }

      setSnapshot({
        gifts: data.gifts,
        totalVotes: data.totalVotes,
        totalParticipants: data.totalParticipants,
        guest: data.guest,
      });
      const nowVoted = data.gifts[gift.key]?.voted ?? false;
      setVoteNotice(
        nowVoted
          ? `Te sumaste a ${gift.name}.`
          : `Saliste del regalo ${gift.name}.`
      );
    } catch {
      setVoteNotice("No se pudo conectar para guardar tu voto. Probá de nuevo.");
    } finally {
      setBusyGiftKey(null);
    }
  };

  const { maxVotes, topGiftName, myVotesCount, orderedGifts } = useMemo(() => {
    let highest = 0;
    let leaderName: string | null = null;
    let mine = 0;

    for (const gift of gifts) {
      const entry = snapshot.gifts[gift.key];
      const count = entry?.count ?? 0;
      if (entry?.voted) mine += 1;
      if (count > highest) {
        highest = count;
        leaderName = gift.name;
      }
    }

    const withIndex = gifts.map((gift, idx) => ({ gift, originalIndex: idx + 1 }));
    if (sortMode === "popular") {
      withIndex.sort((a, b) => {
        const diff =
          (snapshot.gifts[b.gift.key]?.count ?? 0) -
          (snapshot.gifts[a.gift.key]?.count ?? 0);
        return diff !== 0 ? diff : a.originalIndex - b.originalIndex;
      });
    }

    return {
      maxVotes: highest,
      topGiftName: highest > 0 ? leaderName : null,
      myVotesCount: mine,
      orderedGifts: withIndex,
    };
  }, [gifts, snapshot, sortMode]);

  return (
    <>
      {/* Hero Banner: headline + lead beside the guest identification panel */}
      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <h1 className="text-display text-ink">¡Regalos deseados!</h1>
          <p className="lead mt-4 text-ink-2">
            Elegí en qué regalo te sumás con los demás invitados para hacerlo entre todos.
          </p>
        </div>

        <div className="well min-w-0 p-6 lg:col-span-5">
          {snapshot.guest ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted">Invitado identificado</p>
                  <p className="font-display text-title text-ink">{snapshot.guest.name}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchGuest}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-input border border-rule bg-surface px-4 text-sm font-medium text-ink transition-colors duration-fast ease-party hover:bg-paper-2 active:bg-paper-3"
                >
                  Cambiar
                </button>
              </div>
              <p className="text-sm text-ink-2">
                {myVotesCount === 0
                  ? "Tocá «Me sumo» en los regalos en los que quieras participar."
                  : myVotesCount === 1
                    ? "Ya te sumaste a 1 regalo. Podés elegir más o cambiar cuando quieras."
                    : `Ya te sumaste a ${myVotesCount} regalos. Podés cambiar cuando quieras.`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleIdentifySubmit} noValidate className="flex flex-col gap-3">
              <label htmlFor="wishlist-guest-phone" className="text-sm font-medium text-ink">
                Tu número de invitado para votar
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  ref={phoneInputRef}
                  id="wishlist-guest-phone"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="11XXXXXXXX"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  aria-invalid={authError ? true : undefined}
                  aria-describedby="wishlist-guest-help"
                  className="min-h-12 w-full min-w-0 flex-1 rounded-input border border-rule bg-paper px-4 text-base text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus aria-[invalid=true]:border-spot-deep"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={authLoading}
                >
                  {authLoading ? "Verificando…" : "Entrar"}
                </Button>
              </div>
              <p
                id="wishlist-guest-help"
                aria-live="polite"
                className={cn(
                  "min-h-[1.25rem] text-sm",
                  authError ? "font-medium text-spot-deep" : "text-muted"
                )}
              >
                {authError || "Solo quienes figuran en la lista de invitados pueden sumarse."}
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Live summary strip & sort switcher */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-2">
          <span className="num font-medium text-ink">
            {gifts.length} {gifts.length === 1 ? "regalo" : "regalos"}
          </span>
          <span className="num">
            {snapshot.totalParticipants === 0
              ? "Todavía nadie votó"
              : snapshot.totalParticipants === 1
                ? "1 invitado participando"
                : `${snapshot.totalParticipants} invitados participando`}
          </span>
          {topGiftName && (
            <span className="rounded-full bg-lime px-3 py-1 text-xs font-semibold text-lime-ink">
              Va ganando: {topGiftName}
            </span>
          )}
        </div>

        <div
          role="group"
          aria-label="Ordenar regalos"
          className="inline-flex rounded-input border border-rule bg-surface p-1"
        >
          <button
            type="button"
            onClick={() => setSortMode("default")}
            aria-pressed={sortMode === "default"}
            className={cn(
              "min-h-9 rounded-[calc(var(--radius-input)-4px)] px-3 text-sm font-medium transition-colors duration-fast ease-party active:translate-y-px",
              sortMode === "default"
                ? "bg-ink text-paper"
                : "text-ink-2 hover:bg-paper-2 hover:text-ink"
            )}
          >
            Lista original
          </button>
          <button
            type="button"
            onClick={() => setSortMode("popular")}
            aria-pressed={sortMode === "popular"}
            className={cn(
              "min-h-9 rounded-[calc(var(--radius-input)-4px)] px-3 text-sm font-medium transition-colors duration-fast ease-party active:translate-y-px",
              sortMode === "popular"
                ? "bg-ink text-paper"
                : "text-ink-2 hover:bg-paper-2 hover:text-ink"
            )}
          >
            Más votados
          </button>
        </div>
      </div>

      {/* Live status feedback for votes */}
      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-[1.5rem] text-sm font-medium text-ink-2"
      >
        {voteNotice}
      </p>

      {/* Gift cards grid */}
      {gifts.length === 0 ? (
        <div className="well mt-6 p-10">
          <p className="font-display text-title text-ink">Todavía no hay regalos cargados.</p>
          <p className="mt-2 text-ink-2">
            Cuando se agreguen desde el panel de la fiesta, van a aparecer acá para votar.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {orderedGifts.map(({ gift, originalIndex }, displayIdx) => {
            const vote = snapshot.gifts[gift.key];
            const count = vote?.count ?? 0;
            return (
              <ProductCard2
                key={`${gift.key}-${originalIndex}`}
                name={gift.name}
                image={gift.image}
                link={gift.link}
                priority={displayIdx === 0}
                index={originalIndex}
                voteCount={count}
                voters={vote?.voters ?? []}
                maxVotes={maxVotes}
                voted={vote?.voted ?? false}
                isTopVoted={maxVotes > 0 && count === maxVotes}
                votingBusy={busyGiftKey === gift.key}
                onToggleVote={() => void handleToggleVote(gift)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default WishlistCatalog;

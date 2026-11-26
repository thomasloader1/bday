import React from "react";
import Link from "next/link";
import WishlistCatalog from "@/components/WishlistCatalog";
import Button from "@/components/ui/Button";
import { readConfig } from "@/lib/config/store";
import { getWishlistVotes, giftKeyFor } from "@/lib/wishlist/votesStore";

// Gifts and guest votes change live; rendered per request so updates show at once.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Wishlist = async () => {
  const [{ gifts }, initialSnapshot] = await Promise.all([
    readConfig(),
    getWishlistVotes(null),
  ]);

  const items = gifts.map((gift) => ({
    ...gift,
    key: giftKeyFor(gift),
  }));

  return (
    <section className="py-10 md:py-16">
      <WishlistCatalog gifts={items} initialSnapshot={initialSnapshot} />

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-8">
        <p className="text-sm text-ink-2">
          Cada invitado puede sumarse a uno o varios regalos para hacer vaquita entre todos.
        </p>
        <Button asChild variant="secondary">
          <Link href={"/"}>Ir al inicio</Link>
        </Button>
      </footer>
    </section>
  );
};

export default Wishlist;

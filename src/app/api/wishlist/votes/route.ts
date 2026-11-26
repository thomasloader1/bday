import { NextResponse } from "next/server";
import { z } from "zod";
import { getWishlistVotes, toggleWishlistVote, VoteError } from "@/lib/wishlist/votesStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const parseGuestId = (raw: string | null): number | null => {
  if (!raw) return null;
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const ToggleBodySchema = z.object({
  guestId: z.union([z.number().int().positive(), z.string().min(1)]),
  giftKey: z.string().trim().min(1).max(120),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawGuestId = searchParams.get("guestId");
  const guestId = parseGuestId(rawGuestId);

  const snapshot = await getWishlistVotes(guestId);

  if (rawGuestId && !snapshot.guest) {
    return NextResponse.json(
      { ...snapshot, error: "Ese número no está en la lista de invitados." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = ToggleBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ingresá un número de invitado válido." }, { status: 400 });
  }

  const guestId =
    typeof parsed.data.guestId === "number"
      ? parsed.data.guestId
      : parseGuestId(parsed.data.guestId);

  if (guestId === null) {
    return NextResponse.json({ error: "Ingresá un número de invitado válido." }, { status: 400 });
  }

  try {
    const snapshot = await toggleWishlistVote(guestId, parsed.data.giftKey);
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof VoteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

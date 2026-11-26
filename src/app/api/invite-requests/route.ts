import { NextResponse } from "next/server";
import { z } from "zod";
import { createInviteRequest, InviteRequestError, PhoneSchema } from "@/lib/inviteRequests/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  // Digits only: "11 5501-1250" and "1155011250" are the same number.
  phone: z.union([z.string(), z.number()]).transform((v) => Number(String(v).replace(/\D+/g, ""))).pipe(PhoneSchema),
  name: z.string().trim().min(2, "Decinos tu nombre").max(80),
  message: z.string().trim().max(300).default(""),
});

/** Public: someone not on the list asks for an invitation. Answers only "received" (no request data back). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message = issue?.path[0] === "phone" ? "Revisá el número: tiene que ser como 11XXXXXXXX" : issue?.message || "Datos inválidos";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await createInviteRequest(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof InviteRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Invite request failed:", error);
    return NextResponse.json({ error: "No se pudo enviar la solicitud" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { readConfig, VersionConflictError, writeConfig } from "@/lib/config/store";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The full config, guests included. */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(await readConfig(), { headers: { "Cache-Control": "no-store" } });
}

/**
 * Replace the config. Body: the config the editor loaded and changed, with
 * its original `version`. 409 when someone saved in between, 400 with the
 * field errors when it does not validate.
 */
export async function PUT(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: { version?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (typeof body?.version !== "number") {
    return NextResponse.json({ error: "Falta la versión" }, { status: 400 });
  }

  try {
    const saved = await writeConfig(body, body.version);
    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: "La configuración cambió desde que la abriste. Recargá para ver la última versión.", version: error.current },
        { status: 409 }
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Hay campos inválidos",
          issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
        { status: 400 }
      );
    }
    console.error("Config save failed:", error);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}

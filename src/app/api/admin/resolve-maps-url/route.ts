import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { isAllowedMapsHost, parseGoogleMapsCoords } from "@/lib/mapsUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  url: z.string().trim().min(1, "Pegá una URL de Google Maps"),
});

/**
 * Resolves a Google Maps URL (including maps.app.goo.gl / goo.gl short links)
 * into latitude/longitude coordinates. Admin-only and restricted to Google Maps hosts.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pegá una URL de Google Maps" }, { status: 400 });
  }

  const input = parsed.data.url;

  // Fast path: coordinates already present in the string or URL.
  const direct = parseGoogleMapsCoords(input);
  if (direct) {
    return NextResponse.json({ ...direct, resolvedUrl: input });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(input);
  } catch {
    return NextResponse.json(
      { error: "No parece una URL válida de Google Maps." },
      { status: 400 }
    );
  }

  if (
    (targetUrl.protocol !== "https:" && targetUrl.protocol !== "http:") ||
    !isAllowedMapsHost(targetUrl.hostname)
  ) {
    return NextResponse.json(
      { error: "Solo se aceptan enlaces de Google Maps (google.com/maps o maps.app.goo.gl)." },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BdayApp/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    }).finally(() => clearTimeout(timer));

    const finalUrl = response.url || targetUrl.toString();
    const fromFinalUrl = parseGoogleMapsCoords(finalUrl);
    if (fromFinalUrl) {
      return NextResponse.json({ ...fromFinalUrl, resolvedUrl: finalUrl });
    }

    // Fallback: inspect response body for embedded place pin or static-map center coordinates.
    const html = (await response.text()).slice(0, 120_000);
    const fromHtml =
      parseGoogleMapsCoords(html) ??
      (() => {
        const ogCenter = html.match(/center=(-?\d{1,2}\.\d+)(?:%2C|,)(-?\d{1,3}\.\d+)/i);
        return ogCenter ? parseGoogleMapsCoords(`${ogCenter[1]},${ogCenter[2]}`) : null;
      })();

    if (fromHtml) {
      return NextResponse.json({ ...fromHtml, resolvedUrl: finalUrl });
    }

    return NextResponse.json(
      { error: "No pudimos encontrar coordenadas en ese enlace. Probá copiando el link desde el botón Compartir de Google Maps." },
      { status: 422 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo abrir el enlace de Google Maps. Revisá la URL o pegá el enlace completo." },
      { status: 502 }
    );
  }
}

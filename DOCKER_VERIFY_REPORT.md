# Verificación: next-bday en Docker (2026-11-25)

Entorno: `docker compose` · prod `web` (standalone, node:20-alpine) en `:3100` · dev `web-dev` (hot-reload) en `:3101` · Firestore real `bday-ad1e0`.
(Los puertos 3000/3001 del host estaban ocupados por otros contenedores; se configuran con `WEB_PORT` / `WEB_DEV_PORT` en `.env`.)

## Resultado por funcionalidad

| # | Funcionalidad | Resultado | Notas |
|---|---|---|---|
| 1 | Home + búsqueda | ✅ | Título con espacios tras el polish (B1 corregido) |
| 2 | Invitación `/1155011250` | ✅ | Merge guests.json + Firestore, botón "Mira las instrucciones" (ya confirmado) |
| 3 | ID inexistente `/123` | ✅ | Muestra `NoInvitation` |
| 4 | Confirmar asistencia (escritura) | ➖ no ejecutado | El invitado de prueba ya estaba confirmado; no se escribió en prod. Botones Confirmar / No Confirmar visibles para invitado sin doc |
| 5 | Guard `/{id}/confirm` sin confirmar | ✅ | `/1162525834/confirm` → `/1162525834` |
| 6 | Deck / swiper | ✅ | Desktop coverflow (3 slides, mapa Leaflet con tiles) y deck mobile |
| 7 | Wishlist | ✅ | 6 productos |
| 8 | Admin login | ✅ | 400 sin password, 401 mala, 200 + cookie `HttpOnly; Secure; SameSite=strict` |
| 9 | Middleware `/admin/dashboard` sin cookie | ✅ | 307 → `/admin/login?redirected=1` |
| 10 | Dashboard | ✅ | Panel con pestañas Festejo / Textos / Eventos / Invitados / Regalos; guarda en `config.json` (volumen) |
| 11 | Logout | ✅ | Botón "Cerrar sesión" → `POST /api/admin/logout`, vuelve a exigir login |
| 12 | E2E Playwright (prod) | ⚠️ 31 ✅ / 1 ❌ / 16 skip | Falla `iphone-12 › page still scrolls vertically` (B6) |
| — | `next build` en Docker | ✅ | Tras agregar `@playwright/test` (antes fallaba el typecheck de `playwright.config.ts`) |
| — | Hot-reload dev | ✅ | Edición reflejada en ~2 s (`WATCHPACK_POLLING`) |

## Bugs encontrados (no corregidos, fuera de alcance)

- **B1 ✅ corregido (polish Hallmark)** `src/components/BlurText.tsx:51` usa `text.split('')` también en modo `words`, y la línea 118 agrega `''` en vez de espacio → títulos sin espacios.
- **B2 ✅ corregido (polish Hallmark)** `src/app/admin/layout.tsx` renderiza `<html><body>` anidados dentro del root layout → React #418/#423 (hydration mismatch) en todas las páginas `/admin/*`. Debería ser un route group con su propio root layout, o devolver un fragmento.
- **B3 ✅ corregido (dashboard)** Link "Logout" del dashboard apunta a `/admin/logout` (no existe); el endpoint real es `POST /api/admin/logout`.
- **B4 ✅ reemplazado (dashboard)** Firestore rules deniegan lectura de `cards` → "No cards found"; el form "Save Card" no tiene handler (no persiste nada). Contradice `verify-report.md` (admin-dashboard "PASS").
- **B5 ✅ corregido (dashboard)** `/admin` (marcado como público en el middleware) no tiene página: lo captura `[id]` y muestra "invitación no existe".
- **B6** E2E WebKit: el fallback `keyboard.press('End')` no desplaza en WebKit Linux (falla igual contra dev → no es Docker). La página sí es scrolleable (asserción previa pasa).

## Seguridad (solo reporte)

- La colección `persons` es **listable públicamente** con la API key web (REST `GET .../documents/persons` → 200): cualquiera puede enumerar invitados (nombres, grupos, ubicaciones).
- ✅ Corregido: la cookie `admin-session` ahora es un token firmado (HMAC, `SESSION_SECRET`) que vence en 7 días; las APIs `/api/admin/*` también exigen sesión.
- ✅ Corregido: la lista de invitados ya no viaja en el bundle del navegador; se consulta un invitado por vez en `/api/guests/{id}`.
- El dashboard lee Firestore desde el cliente: la "protección" del middleware no protege los datos, solo la página.

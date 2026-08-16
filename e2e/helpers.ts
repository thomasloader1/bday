import { Locator, Page } from '@playwright/test';

/** Guest with 3 groups (friends, family, work) -> 3 deck slides. */
export const DECK_GUEST_ID = '1155011250';

export interface DragOptions {
  /** Extra delay between pointer steps in ms. Higher = slower = lower velocity. */
  pacing?: number;
  /** Pointer step size in px. Defaults to 10. */
  step?: number;
}

/**
 * Opens the confirmed-deck page for the guest. If the confirm guard redirects
 * to the plain invitation page (guest not confirmed yet), drives the real
 * confirm flow (button "Confirmar") which writes Firestore and lands back on
 * /{id}/confirm. Returns once the deck is visible.
 */
export async function openConfirmedDeck(page: Page, id = DECK_GUEST_ID): Promise<void> {
  await page.goto(`/${id}/confirm`);
  await page.waitForURL((url) => url.pathname === `/${id}` || url.pathname === `/${id}/confirm`);

  if (new URL(page.url()).pathname === `/${id}`) {
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await page.waitForURL((url) => url.pathname === `/${id}/confirm`);
  }

  // Desktop renders the coverflow swiper, mobile renders the deck. Wait for
  // whichever surface is expected for the active project.
  await page.waitForSelector('.deck-card, .swiper-slide-active', { state: 'visible' });
}

/**
 * Drags from the center of a locator by (dx, dy) using mouse events with
 * discrete steps so the gesture can be tuned for speed (fast fling) or
 * slowness (spring-back).
 */
export async function dragFrom(
  page: Page,
  locator: Locator,
  dx: number,
  dy = 0,
  options: DragOptions = {}
): Promise<void> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('dragFrom: target has no bounding box');
  const step = options.step ?? 10;
  const pacing = options.pacing ?? 16;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / step));
  const sx = box.x + box.width / 2;
  const sy = box.y + box.height / 2;

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(sx + (dx * i) / steps, sy + (dy * i) / steps);
    if (pacing > 0) await page.waitForTimeout(pacing);
  }
  await page.mouse.up();
}

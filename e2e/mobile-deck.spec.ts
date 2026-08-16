import { test, expect, Page } from '@playwright/test';
import { DECK_GUEST_ID, openConfirmedDeck, dragFrom } from './helpers';

const MOBILE_PROJECTS = ['pixel-7', 'iphone-12', 'narrow-320'];
const SLIDES_COUNT = 3;

test.describe('mobile invitation deck', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!MOBILE_PROJECTS.includes(testInfo.project.name), 'mobile deck spec runs only on mobile projects');
  });

  async function expectActiveDot(page: Page, index: number) {
    await expect(page.locator('.deck-dot').nth(index)).toHaveAttribute('aria-current', 'step');
  }

  test('renders the deck with 3 slides and pagination dots', async ({ page }) => {
    await openConfirmedDeck(page);

    await expect(page.locator('.deck-card')).toBeVisible();
    await expect(page.locator('.deck-dot')).toHaveCount(SLIDES_COUNT);
    await expect(page.locator('.deck-dot[aria-current="step"]')).toHaveCount(1);
    // The swiper coverflow never mounts below 640px.
    await expect(page.locator('.swiper')).toHaveCount(0);
    // Stays on the confirm page — no accidental navigation.
    expect(new URL(page.url()).pathname).toBe(`/${DECK_GUEST_ID}/confirm`);
  });

  test('page does not scroll horizontally', async ({ page }) => {
    await openConfirmedDeck(page);

    const { doc, body } = await page.evaluate(() => {
      const de = document.documentElement;
      return {
        doc: de.scrollWidth <= de.clientWidth,
        body: document.body.scrollWidth <= document.body.clientWidth,
      };
    });
    expect(doc).toBe(true);
    expect(body).toBe(true);
  });

  test('swipe left advances to the next invitation', async ({ page }) => {
    await openConfirmedDeck(page);
    await expectActiveDot(page, 0);

    await dragFrom(page, page.locator('.deck-card'), -260, 0, { pacing: 16 });

    await expectActiveDot(page, 1);
    expect(new URL(page.url()).pathname).toBe(`/${DECK_GUEST_ID}/confirm`);
  });

  test('a short slow drag springs back to the same slide', async ({ page }) => {
    await openConfirmedDeck(page);
    await expectActiveDot(page, 0);

    await dragFrom(page, page.locator('.deck-card'), -60, 0, { pacing: 30 });

    await expectActiveDot(page, 0);
    await expect(page.locator('.deck-dot[aria-current="step"]')).toHaveCount(1);
  });

  test('tapping the calendar CTA does not advance the deck', async ({ page }) => {
    await openConfirmedDeck(page);
    await dragFrom(page, page.locator('.deck-card'), -260, 0, { pacing: 16 });
    await expectActiveDot(page, 1);

    const calendarButton = page.getByRole('button', { name: 'Agendar en calendario', exact: true });
    await expect(calendarButton).toBeVisible();

    // iOS uses the calendario:// custom scheme (popup may not fire at all);
    // other projects open a real google calendar popup. Either way the deck
    // must not advance.
    const popupPromise = page.waitForEvent('popup', { timeout: 3000 }).catch(() => null);
    await calendarButton.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.close().catch(() => {});
    }

    await expectActiveDot(page, 1);
    expect(new URL(page.url()).pathname).toBe(`/${DECK_GUEST_ID}/confirm`);
  });

  test('swiping from the map does not pan it and advances the deck', async ({ page }) => {
    await openConfirmedDeck(page);
    await dragFrom(page, page.locator('.deck-card'), -260, 0, { pacing: 16 });
    await expectActiveDot(page, 1);

    // Slide 1 (family) renders the location map with interactive panning disabled.
    const mapPane = page.locator('.leaflet-map-pane');
    await expect(mapPane).toBeVisible();
    const styleBefore = await mapPane.getAttribute('style');

    await dragFrom(page, mapPane, -200, 0, { pacing: 16 });

    await expectActiveDot(page, 2);
    const styleAfter = await mapPane.getAttribute('style');
    expect(styleAfter).toBe(styleBefore);
  });

  test('CTAs keep 44px touch targets at 320px width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'narrow-320', 'touch-target check is for the 320px project');
    await openConfirmedDeck(page);
    await dragFrom(page, page.locator('.deck-card'), -260, 0, { pacing: 16 });
    await expectActiveDot(page, 1);

    const calendar = page.getByRole('button', { name: 'Agendar en calendario', exact: true });
    await expect(calendar).toBeVisible();
    const calendarBox = await calendar.boundingBox();
    expect(calendarBox?.height).toBeGreaterThanOrEqual(44);

    const maps = page.getByRole('button', { name: 'Abrir en Maps', exact: true });
    await expect(maps).toBeVisible();
    const mapsBox = await maps.boundingBox();
    expect(mapsBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('ArrowRight and ArrowLeft keyboard navigation work', async ({ page }) => {
    await openConfirmedDeck(page);
    await page.locator('.deck').focus();

    await page.keyboard.press('ArrowRight');
    await expectActiveDot(page, 1);

    await page.keyboard.press('ArrowLeft');
    await expectActiveDot(page, 0);
  });

  test('page still scrolls vertically on small screens', async ({ page }) => {
    await openConfirmedDeck(page);

    const scrollable = await page.evaluate(
      () => document.documentElement.scrollHeight > document.documentElement.clientHeight
    );
    expect(scrollable).toBe(true);

    await page.mouse.move(160, 240);
    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBeGreaterThan(0);
  });
});

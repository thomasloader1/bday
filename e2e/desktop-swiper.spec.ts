import { test, expect } from '@playwright/test';
import { DECK_GUEST_ID, openConfirmedDeck } from './helpers';

test.describe('desktop coverflow swiper', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome', 'desktop swiper spec runs only on desktop-chrome');
  });

  test('renders the coverflow swiper with 3 slides, active slide and pagination', async ({ page }) => {
    await openConfirmedDeck(page);

    const swiper = page.locator('.swiper');
    await expect(swiper).toBeVisible();

    // All three invitation slides are mounted by the swiper.
    await expect(page.locator('.swiper-slide')).toHaveCount(3);

    // Coverflow shows the active slide centered plus side neighbors.
    await expect(page.locator('.swiper-slide-active')).toBeVisible();
    await expect(page.locator('.swiper-slide:not(.swiper-slide-active)').first()).toBeVisible();

    // Bullet pagination rendered by the swiper.
    await expect(page.locator('.swiper-pagination-bullet')).toHaveCount(3);
    await expect(page.locator('.swiper-pagination-bullet').first()).toBeVisible();

    // The mobile deck never mounts on desktop.
    await expect(page.locator('.deck-dots')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe(`/${DECK_GUEST_ID}/confirm`);
  });
});

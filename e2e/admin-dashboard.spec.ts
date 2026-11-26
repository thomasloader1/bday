import { test, expect } from '@playwright/test';
import { DECK_GUEST_ID } from './helpers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin12345';

/**
 * Dashboard round trip: log in, change the first paragraph of the letter,
 * see it on the guest's invitation, then put the original back. Only the
 * local config file is written (never Firestore).
 */
test.describe('admin dashboard', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome', 'admin spec runs only on desktop-chrome');
  });

  test('admin APIs and pages are closed without a session', async ({ page, request }) => {
    const api = await request.get('/api/admin/config');
    expect(api.status()).toBe(401);

    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login\?redirected=1/);
  });

  test('wrong password is rejected', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Contraseña').fill('not-the-password');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Contraseña incorrecta.')).toBeVisible();
  });

  test('editing the letter shows on the invitation', async ({ page }) => {
    const marker = `Texto de prueba e2e ${Date.now()}`;

    await page.goto('/admin/login');
    await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Panel del festejo' })).toBeVisible();

    // Keep the original letter to restore it whatever happens.
    const original = await (await page.request.get('/api/admin/config')).json();
    const originalLetter = original.letter;

    try {
      await page.getByRole('tab', { name: 'Textos' }).click();
      const letter = page.getByLabel('Párrafos', { exact: true });
      const current = await letter.inputValue();
      const [, ...rest] = current.split(/\n\s*\n/);
      await letter.fill([marker, ...rest].join('\n\n'));

      const saved = page.waitForResponse(
        (r) => r.url().endsWith('/api/admin/config') && r.request().method() === 'PUT'
      );
      await page.getByRole('button', { name: 'Guardar cambios' }).click();
      expect((await saved).status()).toBe(200);

      await page.goto(`/${DECK_GUEST_ID}`);
      await expect(page.getByText(marker)).toBeVisible();
    } finally {
      // Put back only the letter, on top of the latest version (retry once on a version race).
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const latest = await (await page.request.get('/api/admin/config')).json();
        const restore = await page.request.put('/api/admin/config', {
          data: { ...latest, letter: originalLetter },
        });
        if (restore.status() !== 409) {
          expect(restore.status(), await restore.text()).toBe(200);
          break;
        }
      }
      const after = await (await page.request.get('/api/admin/config')).json();
      expect(JSON.stringify(after.letter)).not.toContain(marker);
    }

    await page.goto('/admin/dashboard');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    expect((await page.request.get('/api/admin/config')).status()).toBe(401);
  });

  test('events are seen only by their groups, minus exceptions, and only when published', async ({ request }) => {
    const login = await request.post('/api/admin/login', { data: { password: ADMIN_PASSWORD } });
    expect(login.ok()).toBe(true);

    const FAMILY_GUEST = 1162525834; // Pedro (Coco), family
    const OTHER_FAMILY_GUEST = 1162525878; // Lela (Mabelita), family
    const eventId = `e2e-${Date.now()}`;
    const titles = async (guest: number) =>
      ((await (await request.get(`/api/guests/${guest}`)).json()).events as { title: string }[]).map((e) => e.title);
    const save = async (change: (config: any) => void) => {
      const config = await (await request.get('/api/admin/config')).json();
      change(config);
      const res = await request.put('/api/admin/config', { data: config });
      expect(res.status(), await res.text()).toBe(200);
    };
    const title = `Evento e2e ${eventId}`;

    try {
      await save((c) =>
        c.events.push({
          id: eventId, published: false, title, paragraphs: ['Prueba'], ps: '', date: null, time: null,
          food: [], requirements: [], location: null, groups: ['family'], include: [], exclude: [FAMILY_GUEST],
        })
      );
      expect(await titles(OTHER_FAMILY_GUEST)).not.toContain(title); // hidden: nobody

      await save((c) => (c.events.find((e: any) => e.id === eventId).published = true));
      expect(await titles(OTHER_FAMILY_GUEST)).toContain(title); // its group sees it
      expect(await titles(FAMILY_GUEST)).not.toContain(title); // excluded
      expect(await titles(Number(DECK_GUEST_ID))).toContain(title); // the deck guest is also in family

      // The public config never carries events.
      expect(Object.keys(await (await request.get('/api/config')).json())).not.toContain('events');
    } finally {
      await save((c) => (c.events = c.events.filter((e: any) => e.id !== eventId)));
    }
    expect(await titles(OTHER_FAMILY_GUEST)).not.toContain(title);
  });
});

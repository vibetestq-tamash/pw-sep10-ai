import { Then } from '@cucumber/cucumber';
import { PSWorld, expect } from '../../support/world';

// ─── Dashboard Page Locators ───────────────────────────────────────────────
const dashboardHeading = (w: PSWorld) => w.page.getByRole('heading', { name: 'Dashboard' }).describe('Dashboard page heading');

// ─── Dashboard Page Steps ──────────────────────────────────────────────────
Then('I should be redirected to the dashboard page', async function (this: PSWorld) {
  await expect(dashboardHeading(this)).toBeVisible();
});

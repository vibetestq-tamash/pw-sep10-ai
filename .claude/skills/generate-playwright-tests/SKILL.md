---
name: generate-playwright-tests
description: Generate Playwright end-to-end tests for the pw-sep10-ai project (OrangeHRM app) following its Page Object Model, fixture, test-data and secrets standards. Use when asked to write, add, extend or generate tests, page objects, or test data in this repository, or to explore a screen of the app and turn it into tests.
---

# Generate Playwright tests (pw-sep10-ai)

This skill produces tests that follow the repository standards. Read the standards first:

- `.github/TEST-STANDARDS.md` (full rules)
- `.github/STANDARDS-QUICK-REFERENCE.md` (checklist)

If these files and this skill disagree, the standards files win.

## Hard rules

1. **Tests import `test` only from `fixtures/appbase`.** Never import `test` or `expect` from `@playwright/test` in a spec.
2. **All UI access goes through `App.<page>.<method>()`.** No `page.*` calls, no selectors, no `expect` in a spec.
3. **Credentials come from `testData`** (`testData.username`, `testData.password`). Never hardcode a user or password.
4. **URL comes from `appUrl`** (`testdata/app.ts`, read from `APP_URL`). Never hardcode a URL.
5. **Data comes from `testdata/`.** No data arrays or literal values in a test body.
6. **Never log a secret.** Log the field name or locator description, never the value.
7. **Every state change is verified** by a POM `verify…` method, which asserts with `expect`.
8. **Each step has a comment** naming the step.
9. **Fix locators in `pom/`, never in a test.**

## Project layout

```
fixtures/appbase.ts      `test` export with App (all page objects) and testData fixtures
pom/basepage.ts          BasePage: navigateTo, getPageTitle, getCurrentUrl
pom/<name>page.ts        one class per page, extends BasePage
pom/index.ts             re-exports every page class
testdata/app.ts          appUrl (APP_URL)
testdata/creds.ts        testData (APP_USER, APP_PASSWORD)
testdata/*.json          domain data, one file per entity, plural lowercase name
tests/NNDescriptiveName.spec.ts   one suite per file
```

## Procedure

1. **Read the existing code.** Look at `pom/loginpage.ts`, `pom/dashboardpage.ts`, `fixtures/appbase.ts` and `tests/01LoginAndDashboard.spec.ts`. Reuse existing page objects and methods before adding new ones.
2. **Explore the screen** when the locators are unknown. Log in with `APP_USER` and `APP_PASSWORD` from the environment, and inspect the real markup. Do not write the password into any file.
3. **Add or extend the page object** in `pom/<name>page.ts`:
   - Extend `BasePage`.
   - Locators are `private` `Locator` fields, assigned in the constructor, each ending in `.describe("...")`.
   - Prefixes: `txt` input, `btn` button, `lnk` link, `hdr` heading, `drp` dropdown, `chk` checkbox, `rad` radio, `elm` other element.
   - Locator precedence: role, then label, placeholder, text, test id. CSS only as a last resort, with a comment.
   - Actions are `enter<Field>`, `click<Element>`, `select<Element>`. Verifications are `verify<Component>Displayed` or `verify<State>` and use `expect`. Composite flows are `perform<Action>`.
   - Every public method logs what it did using `locator.description()`.
4. **Export the page** from `pom/index.ts`. Add it to the `tPages` type and the `App` object in `fixtures/appbase.ts`.
5. **Add test data** to `testdata/<entity>.json` if the test needs values, and import it by name.
6. **Write the spec** in `tests/NNDescriptiveName.spec.ts`:
   - Header comment with `// Covers: ...`.
   - `test.describe` for the suite, `test.beforeEach` for setup (navigate, verify login page, log in).
   - Descriptive test names, no "Test 1".
   - Tag with `{ tag: ['@smoke'] }` or `@regression` where it fits.
   - Use `test.step(..., { box: true })` for multi-part flows.
7. **Check** with `npm run typecheck` and `npm run test:list`.

## Templates

Page object:

```typescript
import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

export class ExamplePage extends BasePage {
    private hdrExample: Locator;
    private btnSave: Locator;

    constructor(page: Page) {
        super(page);
        this.hdrExample = page.getByRole('heading', { name: 'Example' }).describe("Example Header");
        this.btnSave = page.getByRole('button', { name: 'Save' }).describe("Save Button");
    }

    public async verifyExamplePageDisplayed() {
        await expect(this.hdrExample).toBeVisible();
        console.log("Example page is displayed");
    }

    public async clickOnSave() {
        await this.btnSave.click();
        console.log("Clicked on " + this.btnSave.description());
    }
}
```

Spec:

```typescript
// Covers: <what this spec verifies>

import { test } from "../fixtures/appbase";
import { appUrl } from "../testdata/app";

test.describe('Example - Feature', () => {

    test.beforeEach(async ({ App, testData }) => {
        // Step 0: Open the app and log in
        await App.basePage.navigateTo(appUrl);
        await App.loginPage.verifyLoginPageDisplayed();
        await App.loginPage.performLogin(testData.username, testData.password);
        await App.dashboardPage.verifyDashboardDisplayed();
    });

    test('Feature screen can be opened from the menu', { tag: ['@regression'] }, async ({ App }) => {
        // Step 1: Open the screen
        await App.examplePage.clickOnSave();
        // Step 2: Verify the screen is shown
        await App.examplePage.verifyExamplePageDisplayed();
    });
});
```

Remember to add `examplePage` to `tPages` and `App` in `fixtures/appbase.ts`, and export the class from `pom/index.ts`.

## Known facts about the app under test (OrangeHRM 5.9)

- Login fields are `input[name=username]` and `input[name=password]`, with a submit button.
- Navigation is the left sidebar (`.oxd-main-menu`). Prefer clicking the menu to typing URLs, because direct URL navigation races the app's redirects.
- Logout is **not** a link. It is a `menuitem` inside the user dropdown (`.oxd-userdropdown-tab`). The dashboard page object already handles this.
- The Maintenance page has a destructive Confirm button. Never click it in a test.
- Tabs in each module are in the top bar (`.oxd-topbar-body-nav-tab-item`).

## Running

```bash
npm run typecheck
npm run test:list
npm test -- --trace off
```

Environment variables needed: `APP_URL`, `APP_USER`, `APP_PASSWORD`. Set them in the shell or in `.env` (git-ignored). Never commit them.

In the cloud sandbox, the pre-installed Chromium does not match the project's Playwright version, so `npm test` can fail with a missing browser. Work around it with a scratch config outside the repo that sets `launchOptions.executablePath: '/opt/pw-browsers/chromium'` and `args: ['--no-sandbox']`. Do not change `playwright.config.ts` for this.

## Done checklist

- [ ] Spec imports `test` from `fixtures/appbase`.
- [ ] Every UI call goes through `App.<page>`.
- [ ] Credentials from `testData`, URL from `appUrl`, data from `testdata/`.
- [ ] Locators are `private`, with `.describe()`, in the POM.
- [ ] Each state change is verified in a POM method.
- [ ] No secret is logged or committed.
- [ ] `npm run typecheck` passes and `npm run test:list` lists the new tests.
- [ ] Tests were run against the app, or the reason they could not be run is stated.

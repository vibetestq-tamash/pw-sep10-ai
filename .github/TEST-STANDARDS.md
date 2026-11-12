# Test Automation Standards

Every test, page object, fixture and test-data file in this repository follows these standards. Humans and AI agents (planner, generator, healer) must all follow them. Quick checklists are in `STANDARDS-QUICK-REFERENCE.md`.

---

## 1. Project Layout

```
.
├── fixtures/
│   └── appbase.ts            # The `test` export with App and testData fixtures
├── pom/                      # Page Object Model classes
│   ├── index.ts              # Re-exports every page class
│   ├── basepage.ts           # Base class, all pages extend it
│   ├── loginpage.ts
│   └── dashboardpage.ts
├── testdata/                 # All test data. No data inside test bodies.
│   ├── app.ts                # appUrl, read from APP_URL
│   ├── creds.ts              # testData credentials, read from env
│   └── records.json          # Domain data, one file per entity
├── tests/
│   └── NNDescriptiveName.spec.ts
├── .github/                  # Standards and agent definitions (this folder)
├── playwright.config.ts
├── .env.example              # Copy to .env; .env is never committed
└── tsconfig.json
```

---

## 2. Configuration and Secrets

- Secrets and environment-specific values come from environment variables, loaded from `.env` by `playwright.config.ts`.
- `APP_URL`, `APP_USER`, and `APP_PASSWORD` are required. `testdata/app.ts` and `testdata/creds.ts` throw a clear error when one is missing.
- Never hardcode a URL, username, or password in a test, page object, or data file.
- Never log a password or other secret. Log the field name, not the value.
- `.env` is git-ignored. Only `.env.example` is committed, with placeholder values.

---

## 3. Page Object Model (POM)

### 3.1 Base class (`pom/basepage.ts`)

Every page class extends `BasePage`. It provides:
- `protected page: Page`, inherited by subclasses
- Shared navigation and utility methods: `navigateTo`, `getPageTitle`, `getCurrentUrl`

Access modifiers: `public` for external use, `protected` for subclasses, `private` for the class only.

### 3.2 Page classes

**Naming**
- File: `pom/<name>page.ts` (lowercase)
- Class: `export class <Name>Page extends BasePage` (PascalCase)
- Examples: `LoginPage`, `DashboardPage`, `RecordListPage`

**Locators**
- All UI elements are `private` `Locator` fields, assigned in the constructor.
- Every locator ends with `.describe("...")`, so logs show what was touched.
- Prefixes:

| Prefix | Element | Example |
|--------|---------|---------|
| `txt` | Text input | `txtUserName` |
| `btn` | Button | `btnLogin` |
| `lnk` | Link | `lnkLogout` |
| `hdr` | Heading | `hdrDashboard` |
| `drp` | Dropdown | `drpRole` |
| `chk` | Checkbox | `chkRememberMe` |
| `rad` | Radio button | `radMale` |
| `elm` | Other element, such as a message | `elmSuccessMessage` |

**Locator precedence** (use the first that works):
1. Role: `getByRole('button', { name: 'Login' })`
2. Label: `getByLabel('Username')`
3. Placeholder: `getByPlaceholder('Search')`
4. Text: `getByText('Saved')`
5. Test ID: `getByTestId('submit-btn')`
6. CSS or XPath only as a last resort, and documented.

**Methods**
- camelCase.
- Actions: `enter<Field>()`, `click<Element>()`, `select<Element>()`.
- Verifications: `verify<Component>Displayed()` or `verify<State>()`. Verification methods assert with `expect`. Tests never call `expect` directly.
- Composite workflows: `perform<Action>()`, which calls several actions in order.
- Every public method logs what it did, using the locator's `description()`. Log values that are safe to show. Never log passwords.

**Example**

```typescript
import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

export class LoginPage extends BasePage {
    private hdrLogin: Locator;
    private txtUserName: Locator;
    private txtPassword: Locator;
    private btnLogin: Locator;

    constructor(page: Page) {
        super(page);
        this.hdrLogin = page.getByRole('heading', { name: 'Login' }).describe("Login Header");
        this.txtUserName = page.getByRole('textbox', { name: 'Username' }).describe("Username Textbox");
        this.txtPassword = page.getByRole('textbox', { name: 'Password' }).describe("Password Textbox");
        this.btnLogin = page.getByRole('button', { name: 'Login' }).describe("Login Button");
    }

    public async verifyLoginPageDisplayed() {
        await expect(this.hdrLogin).toBeVisible();
        console.log("Login page is displayed");
    }

    public async enterUserName(userName: string) {
        await this.txtUserName.fill(userName);
        console.log("Entered username on " + this.txtUserName.description());
    }

    public async enterPassword(password: string) {
        await this.txtPassword.fill(password);
        console.log("Entered password on " + this.txtPassword.description());
    }

    public async clickOnLogin() {
        await this.btnLogin.click();
        console.log("Clicked on " + this.btnLogin.description());
    }

    public async performLogin(userName: string, password: string) {
        await this.enterUserName(userName);
        await this.enterPassword(password);
        await this.clickOnLogin();
    }
}
```

### 3.3 POM index (`pom/index.ts`)

Export every page class, so fixtures and tests import from one place:

```typescript
export * from "./basepage";
export * from "./loginpage";
export * from "./dashboardpage";
```

### 3.4 Adding a new page

1. Create `pom/<name>page.ts` following 3.2.
2. Export it from `pom/index.ts`.
3. Add it to the `tPages` type and the `App` object in `fixtures/appbase.ts`.
4. Add the page to the Planner's Page Objects list when a plan uses it.

---

## 4. Fixtures (`fixtures/appbase.ts`)

Tests import `test` only from the fixture file:

```typescript
import { test } from "../fixtures/appbase";
```

The fixture provides:
- **`App`**: every page object. Tests call `App.loginPage.clickOnLogin()`.
- **`testData`**: credentials from `testdata/creds.ts`.
- **`bAll`**: a worker-scoped setup and teardown hook that runs automatically.

Add each new page class to the `tPages` type and the `App` object. Never import `@playwright/test`'s `test` in a spec file.

---

## 5. Test Data (`testdata/`)

- **Credentials**: `testdata/creds.ts`, named exports, values from env only.
- **Domain data**: `testdata/<entity>.json`, lowercase, plural. Examples: `records.json`, `customers.json`.
- **Structure**: group by entity or scenario. Use descriptive field names. Include realistic values. Keep test cases as array items.
- **Import** in tests by named export: `import { records } from "../testdata/records.json";`
- **Never** put data arrays or literal values inside a test body.

---

## 6. Test Files (`tests/*.spec.ts`)

### 6.1 Naming
- `tests/NNDescriptiveName.spec.ts`, where `NN` is an optional order number.
- Name describes the feature or scenario, e.g. `01LoginAndDashboard.spec.ts`.

### 6.2 Header
Every spec starts with a short comment that states what it covers. If the spec was generated from a plan, also list the plan and seed file:

```typescript
// spec: plans/login-plan.md
// seed: tests/01LoginAndDashboard.spec.ts
// Covers: login with valid credentials, logout
```

### 6.3 Structure

```typescript
import { test } from "../fixtures/appbase";
import { appUrl } from "../testdata/app";

test.describe('Login - Smoke', () => {

    test.beforeEach(async ({ App }) => {
        await App.basePage.navigateTo(appUrl);
        await App.loginPage.verifyLoginPageDisplayed();
    });

    test('Valid user can log in and reach the dashboard', { tag: ['@smoke'] }, async ({ App, testData }) => {
        // Step 1: Log in with the configured test user
        await App.loginPage.performLogin(testData.username, testData.password);

        // Step 2: Verify the dashboard is shown
        await App.dashboardPage.verifyDashboardDisplayed();
    });
});
```

Rules:
- `test.describe()` groups tests by feature. The suite name is descriptive.
- `test.beforeEach()` does common setup: navigate and log in.
- Each test has a descriptive name. Do not use names like "Test 1".
- A comment before each step, naming the step.
- Verify state after every action that changes state.
- Tests contain no raw Playwright calls and no hardcoded data.

### 6.4 Data-driven tests

**Pattern A: one test per data item.** Use this when each item should report separately.

```typescript
import { records } from "../testdata/records.json";

for (const record of records) {
    test(`Add record: ${record.firstName} ${record.lastName}`, async ({ App }) => {
        // Step 1: ...
    });
}
```

**Pattern B: one test with steps.** Use this when the items form one linear flow.

```typescript
test('Add all records', async ({ App }) => {
    for (const record of records) {
        await test.step(`Add record: ${record.firstName}`, async () => {
            // ...
        }, { box: true });
    }
});
```

### 6.5 Steps
- Use `test.step('...', async () => {...}, { box: true })` for multi-part flows, so reports show each part.
- Use tags for categories: `{ tag: ['@smoke', '@regression'] }`.

### 6.6 Best practices

**Do**
- Use POM methods for every UI interaction.
- Use the `App` and `testData` fixtures.
- Group related tests with `test.describe()`.
- Reference test data by field name: `record.firstName`.
- Verify state after each action.

**Don't**
- Don't call `page` or any Playwright API directly in a test.
- Don't hardcode URLs, users, passwords or data.
- Don't mix concerns. A login test does not verify record creation.
- Don't skip a verification to make a test pass.

---

## 7. Agents

Three AI agents work on this repository. Their definitions are in `.github/agents/`.

| Agent | Purpose | Standards section |
|-------|---------|-------------------|
| Planner | Explores the app and writes a test plan | 7.1 |
| Generator | Turns a plan into a `.spec.ts` file | 7.2 |
| Healer | Fixes failing tests | 7.3 |

### 7.1 Planner
- Output: a markdown plan with `# Test Plan`, numbered suites, and numbered scenarios.
- Each scenario lists: prerequisite, data used (from `testdata/`), numbered steps, expected results, page objects involved, and a seed file.
- Include happy paths, edge cases, error and validation scenarios, and data variations.
- Scenarios are independent and can run in any order.

### 7.2 Generator
- Imports `test` from `fixtures/appbase`. Imports data from `testdata/`.
- One suite per file. A test title matches the scenario name in the plan.
- Uses only POM methods. Uses `testData` for credentials.
- Puts a comment with each plan step before the code for that step.
- Uses `test.step` with `{ box: true }` for complex flows.
- Uses the data-driven pattern when the plan has several data items.
- Adds the generated file under `tests/` and runs `npm run typecheck` before finishing.

### 7.3 Healer
- Runs the failing tests, debugs each one, and fixes the cause.
- Fixes a broken locator in the POM file, not in the test.
- Fixes a data problem in the `testdata/` file, not in the test.
- Adds a missing method to the POM file. Never adds raw Playwright code to a test.
- Uses stable, semantic locators. Avoids CSS indices and complex XPath.
- Marks a test with `test.fixme('<reason>')` only when the failure is environmental (network, database, external service down). Never skips a test because of an application bug.

---

## 8. Playwright Configuration

- `playwright.config.ts` loads `.env`.
- Traces are recorded on first retry.
- Reporters: `list` and `html`.
- Retries and workers depend on `CI`.
- `forbidOnly` is set on CI, so a leftover `test.only` fails the build.

---

## 9. Validation Checklist

Before a test is complete, confirm:

- [ ] Imports `test` from `fixtures/appbase`, not `@playwright/test`.
- [ ] All UI access goes through `App.<page>.<method>()`.
- [ ] Credentials come from `testData`.
- [ ] Data comes from `testdata/`. No inline arrays or literal values.
- [ ] No URL is hardcoded. `appUrl` is used.
- [ ] File is in `tests/` and ends in `.spec.ts`.
- [ ] `test.describe()` has a clear suite name, and each test has a descriptive name.
- [ ] Complex flows use `test.step()`.
- [ ] Each state change is verified by a POM method.
- [ ] Each step has a comment.
- [ ] No secret is logged.
- [ ] `npm run typecheck` passes.

---

## 10. Version

- Standards version: 1.0
- Maintainers: the QA team. Propose changes by pull request, and update this file and `STANDARDS-QUICK-REFERENCE.md` together.

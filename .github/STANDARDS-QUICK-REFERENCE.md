# Test Standards: Quick Reference

Full rules: `TEST-STANDARDS.md`. This page is the short version.

## Before you commit, check

**POM**
- [ ] Class extends `BasePage`.
- [ ] Locators are `private`, with `.describe()`.
- [ ] Locator prefixes: `txt`, `btn`, `lnk`, `hdr`, `drp`, `chk`, `rad`, `elm`.
- [ ] Methods are camelCase. Verifications use `expect` inside the POM, not in tests.
- [ ] Every method logs, and no method logs a password.

**Fixtures and data**
- [ ] Test imports `test` from `fixtures/appbase`.
- [ ] Pages used as `App.<page>.<method>()`.
- [ ] Credentials as `testData.username` / `testData.password`.
- [ ] URL as `appUrl`.
- [ ] Data imported from `testdata/`.
- [ ] Secrets only in `.env`. Nothing secret in the code.

**Tests**
- [ ] File in `tests/`, named `NNDescriptiveName.spec.ts`.
- [ ] `test.describe()` for the suite, `test.beforeEach()` for setup.
- [ ] Descriptive test names.
- [ ] A comment before each step.
- [ ] Each state change is verified.
- [ ] `npm run typecheck` passes.

## Locator precedence

1. `getByRole('button', { name: 'Login' })`
2. `getByLabel('Username')`
3. `getByPlaceholder('Search')`
4. `getByText('Saved')`
5. `getByTestId('submit-btn')`
6. CSS or XPath, last resort only

## Patterns

**One test per data item**
```typescript
for (const record of records) {
    test(`Add record: ${record.firstName}`, async ({ App }) => {
        // ...
    });
}
```

**One test with steps**
```typescript
await test.step('Add record', async () => {
    // ...
}, { box: true });
```

## Red flags

| Don't | Do |
|-------|----|
| `import { test } from "@playwright/test"` | `import { test } from "../fixtures/appbase"` |
| `await page.click('...')` in a test | `await App.<page>.<method>()` |
| `const url = 'https://...'` | `appUrl` from `testdata/app.ts` |
| `const user = 'admin'` | `testData.username` |
| Data array in a test body | Import from `testdata/*.json` |
| Public locator in a POM class | `private` locator with `.describe()` |
| `console.log(password)` | Log the field name only |
| `test.skip()` for an app bug | Keep the test failing; file a bug |

## Commands

```bash
npm install
npx playwright install chromium
cp .env.example .env        # then fill in values
npm run typecheck
npm test
npm run report
```

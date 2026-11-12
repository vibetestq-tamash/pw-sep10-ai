# pw-sep10-ai

Playwright end-to-end tests built on the Page Object Model, with shared test standards.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # then set APP_URL, APP_USER, APP_PASSWORD
```

## Run

```bash
npm run typecheck      # TypeScript check
npm run test:list      # list tests without running them
npm test               # run all tests
npm run report         # open the HTML report
```

## CI (GitHub Actions)

`.github/workflows/playwright.yml` runs the suite. Configure these under **Settings > Secrets and variables > Actions**:

| Kind | Name | Value |
|------|------|-------|
| Variable | `APP_URL` | Application URL |
| Variable | `APP_USER` | Login user name |
| Secret | `APP_PASSWORD` | Login password |

The password is only ever read from the `APP_PASSWORD` secret. It is never written to the repository.

## Standards

Read `.github/TEST-STANDARDS.md` before writing or changing tests. `.github/STANDARDS-QUICK-REFERENCE.md` is the checklist.

The three agent definitions in `.github/agents/` (planner, generator, healer) follow the same standards.

## Layout

- `fixtures/` the `test` export with `App` and `testData`
- `pom/` page object classes
- `testdata/` URL, credentials and data files
- `tests/` specs, named `NNDescriptiveName.spec.ts`

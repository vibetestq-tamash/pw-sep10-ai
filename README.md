# pw-sep10-ai

Playwright end-to-end tests built on the Page Object Model, with shared test standards.

The same OrangeHRM scenarios are also written three ways with Cucumber (BDD), to compare styles:

| Folder | Style | Run |
|---|---|---|
| `bdd/` | Plain BDD: steps call Playwright directly | `npm run test:bdd` |
| `bddpom/` | BDD with the Page Object Model: steps call page classes | `npm run test:bddpom` |
| `psd/` | PSD (Page Step Definitions): one step file per page, no page classes; AI-generated steps | `npm run test:psd` |

See [Cucumber BDD suites](#cucumber-bdd-suites) below.

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
- `bdd/`, `bddpom/`, `psd/` Cucumber suites (below)

## Cucumber BDD suites

All three suites run the same scenarios against the HRM app, using Cucumber with TypeScript step files
executed by [tsx](https://tsx.is) (no build step). Each suite has its own `cucumber.json`.

| Feature file | Scenario | Tags |
|---|---|---|
| `login.feature` | Successful login | `@smoke @login` |
| `add-employee.feature` | Add a new employee | `@smoke @employee` |
| `edit-employee.feature` | Edit the middle name of an employee | `@regression @employee` |

> The login credentials are written in the feature files, unlike the Playwright specs, which read
> the password from `.env` / the `APP_PASSWORD` secret.

### Running

```bash
npm run test:bdd                                   # whole suite (also test:bddpom, test:psd)
npm run test:bdd -- --tags "@smoke"                # by tag: "@regression", "@smoke and @employee", "not @employee"
npm run test:bdd -- --dry-run                      # list undefined steps without opening a browser
npm run test:bddpom -- --dry-run --format usage    # also shows unused step definitions
npm run test:psd -- --profile files psd/features/login.feature   # only the named feature file(s)
```

- Browsers open headed. In `psd/` set `HEADLESS=true` to hide the browser.
- Naming a feature file only narrows the run in `psd/`, with `--profile files`. In `bdd/` and
  `bddpom/` (and in `psd/` without the profile) Cucumber adds the file to the configured paths, so
  the whole suite still runs.
- Reports are written to `<suite>/reports/cucumber-report.html` (`psd/` also writes a JSON report and
  `rerun.txt`; re-run failures with `npm run test:psd -- @psd/reports/rerun.txt`). `reports/` folders
  are git-ignored.

### `bdd/` — plain BDD

```
bdd/
  cucumber.json
  features/            login, add-employee, edit-employee
  support/world.ts     HrmWorld: browser, context, page, launch(), close()
  support/hooks.ts     Before → launch, After → close; step timeout 30 s
  steps/               login.steps.ts, employee.steps.ts — Playwright calls inside the steps
```

`bdd/steps/login.ts` is the first version, kept for reference; it is not loaded.
`add-employee.feature` currently has a step without code, `I enter middle name as "William"`;
the dry run reports it as undefined.

### `bddpom/` — BDD with the Page Object Model

```
bddpom/
  cucumber.json
  features/            same three feature files
  pages/               BasePage, LoginPage, DashboardPage, AddEmployeePage, PersonalDetailsPage
  support/world.ts     HrmWorld: launches the browser, then creates the page objects
  support/hooks.ts     Before → launch, After → close
  steps/               steps only call page objects, e.g. this.addEmployeePage.addEmployee(first, last)
```

Cucumber creates a new World per scenario. The `Before` hook opens the browser; the World then builds
the page objects on that page, and the steps reach them through `this.<name>Page`. Only page classes
hold locators and assertions.

### `psd/` — Page Step Definitions

Based on [qtpsudhakar/psd-agentic](https://github.com/qtpsudhakar/psd-agentic). There are no page
classes: each step file **is** the page.

```
psd/
  cucumber.json                     default profile (all features) + "files" profile (named files only)
  features/                         same three feature files
  support/world.ts                  PSWorld: page, context, baseUrl, initPlaywright(), closeContext(),
                                    and an expect with a 20 s timeout
  support/hooks.ts                  Before → initPlaywright, After → closeContext, AfterAll → close browser
  steps/pages/<page>.page.steps.ts  login, dashboard, add-employee, personal-details
```

Rules for a step file:
- Locators are functions at the top of the file, each ending in `.describe('...')`:
  `const loginButton = (w: PSWorld) => w.page.getByRole('button', { name: 'Login' }).describe('Login submit button');`
- Steps call them (`loginButton(this).click()`); no locators inside step bodies.
- Import `expect` from `support/world.ts`, not `@playwright/test`.
- One browser for the whole run; each scenario gets a fresh context. The app URL comes from
  `worldParameters.baseUrl`, or the `AUT_BASE_URL` environment variable.

### VS Code

`.vscode/settings.json` (local only, git-ignored) tells the Cucumber extension where the feature files
and step definitions of all three suites are, so steps are recognised:

```json
{
  "cucumber.features": ["bdd/features/**/*.feature", "bddpom/features/**/*.feature", "psd/features/**/*.feature"],
  "cucumber.glue": ["bdd/steps/*.steps.ts", "bddpom/steps/**/*.ts", "psd/steps/**/*.steps.ts"]
}
```

Because all three suites share the same step text, Go to Definition may list three matches.

## GitHub Agentic Workflow — PSD test generator

Set up with `gh aw init` ([GitHub Agentic Workflows](https://github.github.com/gh-aw/)) and adapted
from psd-agentic. Source: `.github/workflows/test-generator.md`; the compiled
`test-generator.lock.yml` is generated — never edit it, run `gh aw compile` after changing the `.md`.

**Trigger:** a push that adds or changes `psd/features/**/*.feature` (not on `test-gen/**` branches),
or **Actions → test-generator → Run workflow** (optionally with one feature file).

**What the agent does** (Copilot engine, model `claude-haiku-4.5`):
1. Dry-runs the PSD suite to find undefined steps.
2. Logs in to the live app with `playwright-cli` and reads each page's accessibility tree for locators.
3. Writes the missing steps into `psd/steps/pages/<page>.page.steps.ts`, following the PSD rules.
4. Checks TypeScript and that no step is left undefined.
5. Runs the changed feature files headless; if a scenario fails, fixes only its own new steps and
   re-runs (at most 3 runs).
6. Writes `psd/test-reports/<feature>.md` from the final run: result, attempts, every step with status
   and duration, and any errors.
7. Opens a pull request on `test-gen/psd-<feature>` with the step files and that report, titled
   `✅ verified …` or `❌ failing …`. The full HTML/JSON report is uploaded as the run artifact
   `psd-cucumber-report`.

The agent never edits feature files, `psd/support/`, or any other folder, and never commits with git —
the pull request is created by gh-aw's safe-output job.

## GitHub Agentic Workflow — PSD test executor

Source: `.github/workflows/test-executor.md` (compiled to `test-executor.lock.yml`).

**Trigger:** **Actions → test-executor → Run workflow**, or a push to `main` that changes
`psd/features/`, `psd/steps/`, `psd/support/` or `psd/cucumber.json` (for example, merging a
test-generator PR).

**What the agent does** (Copilot engine, model `claude-haiku-4.5`):
1. Runs the whole PSD suite headless.
2. Re-runs each failed scenario once; one that passes now is recorded as **flaky** and left alone.
3. Reproduces each remaining failure by hand with `playwright-cli` and decides:
   - **Step definition** (locator renamed or ambiguous, element appears later, step code wrong) →
     fixes the step in `psd/steps/pages/` and re-runs it, at most 3 attempts, reverting what it can't heal.
   - **Application** (error page, data not saved, behaviour differs from the feature file) →
     raises an `[app-defect]` issue with reproduction steps and evidence (checks for an existing
     issue first) and changes no code.
4. Writes `psd/test-reports/execution-<date>.md`: first and final results per scenario, fixes, issues,
   flaky scenarios.
5. **Only if step files changed:** opens a `[test-heal]` PR with the fixed step files and that report.

The feature files are the contract: the agent never edits them, `psd/support/` or `psd/cucumber.json`,
and never makes a test pass by removing assertions, changing expected values or step text, or adding sleeps.
The HTML/JSON reports of every run are uploaded as the artifact `psd-execution-report`.
An all-green run creates no PR and no issue.

## Running the agentic workflows

**Before the first run:** add the `COPILOT_GITHUB_TOKEN` repository secret (`gh aw secrets bootstrap`
walks you through it), and make sure Claude Haiku 4.5 is enabled in your Copilot model settings.

Other files from `gh aw init`: `.github/agents/agentic-workflows.md`, `.github/skills/agentic-workflow*`,
`.github/mcp.json`, `.github/workflows/copilot-setup-steps.yml`, `.github/aw/actions-lock.json`, and
`.gitattributes` (marks `.lock.yml` files as generated).

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

### Healing run: execution, maintenance and defects in parallel (`psd/`)

```bash
npm run test:psd:heal                        # Run A with healing + the heal monitor
npm run test:psd:heal -- --tags "@smoke"     # extra arguments go to Cucumber
```

Two parts work side by side:

| Part | File | What it does |
|---|---|---|
| **Cucumber step healer** (inside Run A) | `psd/support/step-healer.ts` | When a step fails, Copilot (Claude Haiku 4.5, through the Copilot CLI) finds out why, finishes the step from the statement that failed, and proposes a corrected step definition file. The scenario continues. |
| **Heal monitor** (beside Run A) | `psd/heal/orchestrator.ts` | Starts Run A, picks up each heal event as soon as it appears, verifies fixes and confirms defects with clean re-runs (at most 2 at a time), then writes the summary, one pull request and the trend history. |

```
Run A (healing on)                 Heal monitor (parallel)
scenario 2 ✗ → healed ───────────► clean re-run of scenario 2 with the fix, healing off → ✅ verified / ❌ rejected
scenario 4 ✗ → APPLICATION ──────► clean re-run of scenario 4 → still fails → GitHub issue (or "not reproduced")
scenario 5 ✗ → Copilot gave up ──► 👀 manual review
app not answering ───────────────► one environment issue, healing stopped
Run A ends ──────────────────────► waits only for work in progress → summary, pull request, history
```

**The step healer, when a step fails:**
1. **Evidence** is captured at once: screenshot, accessibility snapshot, URL, and the scenario's Playwright
   trace (saved when the scenario ends). The screenshot is also attached to the HTML report.
2. **Environment check**: if the app does not answer, healing stops for the run and one environment event
   is emitted. No Copilot calls are spent on a broken environment.
3. **Pinpoint and context**: the failing statement is found from the error stack. Copilot sees the step
   function statement by statement (✓ executed, ✗ failed, · not executed), the feature file, the
   scenario's step statuses, the parameters, every step definition file the scenario uses, the error and
   the page as it was when the step failed:
   ```
    21 ✓   await firstNameInput(this).fill(firstName);
    23 ✓   await saveButton(this).click();
    26 ✗   await expect(personalDetailsHeading(this)).toBeVisible();   <-- FAILED HERE
    27 ·   await expect(firstNameInput(this)).toHaveValue(firstName);
   ```
4. **Investigate**: Copilot can ask for read-only checks of the live page (snapshot, URL, or a locator's
   count, visibility, text and value).
5. **Verdict with a confidence (high, medium or low)**:
   - **APPLICATION**: the app does not behave as the feature file says. The step fails.
   - **STEP**: Copilot returns **RESUME** (the statements still to run, adapted to the current page) and
     **FILE** (the corrected file). The file must compile and keep the same step texts and imports;
     RESUME may not drop an assertion. RESUME runs now, so the step finishes without repeating what already
     ran, and the rest of Run A uses the corrected definitions.
   - No usable answer within `STEP_HEAL_CALLS`: **manual review**.

The healer never writes step definition files; only fixes verified by the monitor are kept.

**The heal monitor, per event:**

| Event | Action | Result |
|---|---|---|
| healed | clean re-run of that scenario in a copy of `psd/` with the corrected file applied, healing off | ✅ **verified** when the healed step passes (even if an unrelated later step still fails), ❌ **rejected** when it fails. If the re-run stopped at an earlier step, it waits for the run's other fixes and tries once more, else 👀 manual review |
| application | clean re-run of the scenario to confirm | 🐞 **issue** when the same step fails again, 〰️ **not reproduced** otherwise |
| manual review | none | 👀 listed in the summary |
| environment | none | 🌐 one environment issue |

- **Issues** are labelled `app-defect` (confidence high) or `needs-triage` (medium or low). Each carries a
  fingerprint (page, step and kind of error). If an open issue has the same fingerprint, it gets a comment
  instead of a new issue. The issue includes the reason, the failed statement, the error, the page and
  where to find the evidence.
- **One pull request per run** contains every verified fix with its reason and changed lines. It is never
  merged automatically.
- **Trend history**: each run is added to `psd/heal-history/history.jsonl`, and
  `psd/heal-history/dashboard.html` shows passed/failed per run, heals, verified and rejected fixes,
  defects and Copilot calls.
- Locally, issues and the pull request are only **drafted** under `psd/reports/heal-run/<run>/`
  (`issues/`, `verified-fixes/`, `summary.md`). Set `STEP_HEAL_ISSUES=true` and `STEP_HEAL_PR=true` to
  create them for real (needs `gh` signed in).

**Run folder** `psd/reports/heal-run/<run>/`: `events/`, `evidence/<id>/` (screenshot, snapshot, trace,
URL), `verify/<id>/rerun.log`, `step-heals.jsonl`, `summary.md`, `issues/`, `verified-fixes/`.

**Unique test data and parallel scenarios**: `{{run}}` in a step parameter is replaced with 6 hex
characters that are unique per run (derived from `RUN_ID`, otherwise random), e.g.
`last name "Smith-{{run}}"`. This works for every run, with or without healing. OrangeHRM pre-fills the
next Employee Id when the Add Employee form opens, so two employees added at the same moment would get the
same id. The features therefore set it themselves with `And I enter employee id "A{{run}}"` (add) and
`"E{{run}}"` (edit), and Cucumber runs 2 scenarios at a time (`"parallel": 2` in `psd/cucumber.json`).
Clean re-runs get their own `RUN_ID`, so they never collide with Run A either.

| Variable | Default | Meaning |
|---|---|---|
| `STEP_HEAL_MODEL` | `claude-haiku-4.5` | Copilot model |
| `STEP_HEAL_CALLS` | `5` | Copilot calls per failing step, page checks and retries included |
| `STEP_HEAL_MAX` | `5` | maximum healed steps per Cucumber process |
| `STEP_HEAL_TIMEOUT_MS` | `300000` | step timeout while healing is on |
| `STEP_HEAL_RESUME_ACTION_TIMEOUT_MS` | `15000` | action timeout while a proposed RESUME runs |
| `STEP_HEAL_PARALLEL` | `2` | clean re-runs at the same time |
| `STEP_HEAL_ISSUES` | off | `true` creates or comments GitHub issues |
| `STEP_HEAL_PR` | off | `true` pushes a branch and opens the pull request |
| `STEP_HEAL_DEBUG` | off | `true` keeps every Copilot prompt and reply in the run folder |
| `COPILOT_GITHUB_TOKEN` | none | Copilot token in CI (locally your `copilot login` is used) |

Scenarios tagged `@no-step-heal` are never healed. Short-lived messages such as toasts may be gone by
the time Copilot looks, so it also relies on the error text.

**Fix cache: the same failure is healed once.** A failure is identified by the step definition file,
the step, the failing statement and the file's current content. Before asking Copilot, the healer looks
for a known fix:

| Where the fix comes from | Copilot call | Clean re-run |
|---|---|---|
| verified in an earlier run, not merged yet (`psd/heal-history/fixes.json`) | none | none: shown as ♻️ reused, and included in the pull request again |
| found earlier in this run by any worker (`<run>/fixes/`) | none | shared with the first heal |
| another worker is healing the same failure right now | none: it waits for that worker's fix | shared |
| none of these | yes | yes |

A cached fix must still pass on the real page (its RESUME runs as usual); if it does not, Copilot is asked
and is shown the old fix as a hint. When the step file changes (the fix is merged, or someone edits the
file), its cache entries no longer match and are removed at the next start. In GitHub Actions the cache
is kept with the history.

In GitHub Actions: **Actions → PSD heal run → Run workflow** (`.github/workflows/psd-heal-run.yml`,
optional tag expression). It runs `npm run test:psd:heal` with issues and the pull request switched on,
writes the summary to the job summary, keeps the history in the Actions cache, and uploads reports,
evidence and the dashboard as the artifact `psd-step-heal-report`. It needs the `COPILOT_GITHUB_TOKEN`
secret and **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**.

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

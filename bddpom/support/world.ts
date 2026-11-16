import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { LoginPage, DashboardPage, AddEmployeePage, PersonalDetailsPage } from '../pages';

// Cucumber creates a new World for every scenario.
// It owns the browser and hands the page objects to the steps.
export class HrmWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;
  addEmployeePage!: AddEmployeePage;
  personalDetailsPage!: PersonalDetailsPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async launch() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    // Page objects need a page, so they are created only after the page exists.
    this.loginPage = new LoginPage(this.page);
    this.dashboardPage = new DashboardPage(this.page);
    this.addEmployeePage = new AddEmployeePage(this.page);
    this.personalDetailsPage = new PersonalDetailsPage(this.page);
  }

  async close() {
    await this.browser?.close();
  }
}

setWorldConstructor(HrmWorld);

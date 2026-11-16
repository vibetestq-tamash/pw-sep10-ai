import { setWorldConstructor, World, IWorldOptions, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export class LoginWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async launch() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }
}

setWorldConstructor(LoginWorld);

After(async function (this: LoginWorld) {
  await this.browser?.close();
});

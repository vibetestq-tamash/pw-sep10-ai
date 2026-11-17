import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect as baseExpect } from '@playwright/test';

// One browser for the whole run; each scenario gets its own context and page.
let browser: Browser | undefined;

export class PSWorld extends World {
  private _page?: Page;
  private _context?: BrowserContext;
  baseUrl: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.baseUrl = process.env.AUT_BASE_URL ?? options.parameters.baseUrl ?? '';
  }

  async initPlaywright(): Promise<void> {
    const b = await getBrowser();
    this._context = await b.newContext({ baseURL: this.baseUrl });
    this._page = await this._context.newPage();
    this._page.setDefaultTimeout(30000);           // click, fill, ...
    this._page.setDefaultNavigationTimeout(60000); // goto
  }

  async closeContext(): Promise<void> {
    await this._context?.close();
    this._context = undefined;
    this._page = undefined;
  }

  get page(): Page {
    if (!this._page) throw new Error('Playwright page is not initialized. Call initPlaywright() in a Before hook.');
    return this._page;
  }

  get context(): BrowserContext {
    if (!this._context) throw new Error('Playwright context is not initialized. Call initPlaywright() in a Before hook.');
    return this._context;
  }
}

setWorldConstructor(PSWorld);

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    // Headed by default; set HEADLESS=true to hide the browser
    browser = await chromium.launch({ headless: process.env.HEADLESS === 'true' });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  await browser?.close();
  browser = undefined;
}

// Assertion timeout for every step. The app is slow after saving an employee, so 20s.
export const expect = baseExpect.configure({ timeout: 20000 });

import { Page } from "@playwright/test";

// Every page class extends BasePage.
// Shared navigation and utility methods live here.
export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public getPage() {
        return this.page;
    }

    public async navigateTo(url: string) {
        await this.page.goto(url);
        console.log("Navigated to URL: " + url);
    }

    public async getPageTitle() {
        return await this.page.title();
    }

    public async getCurrentUrl() {
        return this.page.url();
    }
}

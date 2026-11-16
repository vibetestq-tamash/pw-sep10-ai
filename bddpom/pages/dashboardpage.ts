import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

export class DashboardPage extends BasePage {

    private hdrDashboard: Locator;
    private lnkPIM: Locator;

    constructor(page: Page) {
        super(page);
        this.hdrDashboard = page.getByRole('heading', { name: 'Dashboard' }).describe("Dashboard Header");
        this.lnkPIM = page.getByRole('link', { name: 'PIM' }).describe("PIM Menu Link");
    }

    public async verifyDashboardDisplayed() {
        await expect(this.hdrDashboard).toBeVisible();
        console.log("Dashboard is displayed");
    }

    public async clickOnPIM() {
        await this.lnkPIM.click();
        console.log("Clicked on " + this.lnkPIM.description());
    }
}

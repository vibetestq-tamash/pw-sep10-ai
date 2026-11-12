import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

export class DashboardPage extends BasePage {

    private hdrDashboard: Locator;
    private lnkLogout: Locator;

    constructor(page: Page) {
        super(page);
        this.hdrDashboard = page.getByRole('heading', { name: 'Dashboard' }).describe("Dashboard Header");
        this.lnkLogout = page.getByRole('link', { name: 'Logout' }).describe("Logout Link");
    }

    public async verifyDashboardDisplayed() {
        await expect(this.hdrDashboard).toBeVisible();
        console.log("Dashboard is displayed");
    }

    public async clickOnLogout() {
        await this.lnkLogout.click();
        console.log("Clicked on " + this.lnkLogout.description());
    }
}

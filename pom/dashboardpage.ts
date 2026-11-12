import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

export class DashboardPage extends BasePage {

    private hdrDashboard: Locator;
    private btnUserDropdown: Locator;
    private lnkLogout: Locator;

    constructor(page: Page) {
        super(page);
        this.hdrDashboard = page.getByRole('heading', { name: 'Dashboard' }).describe("Dashboard Header");
        // Logout lives in the user dropdown in the top bar (OrangeHRM 5), as a menu item.
        this.btnUserDropdown = page.locator('.oxd-userdropdown-tab').describe("User Dropdown");
        this.lnkLogout = page.getByRole('menuitem', { name: 'Logout' }).describe("Logout Menu Item");
    }

    public async verifyDashboardDisplayed() {
        await expect(this.hdrDashboard).toBeVisible();
        console.log("Dashboard is displayed");
    }

    public async clickOnLogout() {
        await this.btnUserDropdown.click();
        console.log("Clicked on " + this.btnUserDropdown.description());
        await this.lnkLogout.click();
        console.log("Clicked on " + this.lnkLogout.description());
    }
}

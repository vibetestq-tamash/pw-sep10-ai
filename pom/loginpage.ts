import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

export class LoginPage extends BasePage {

    private hdrLogin: Locator;
    private txtUserName: Locator;
    private txtPassword: Locator;
    private btnLogin: Locator;

    constructor(page: Page) {
        super(page);
        this.hdrLogin = page.getByRole('heading', { name: 'Login' }).describe("Login Header");
        this.txtUserName = page.getByRole('textbox', { name: 'Username' }).describe("Username Textbox");
        this.txtPassword = page.getByRole('textbox', { name: 'Password' }).describe("Password Textbox");
        this.btnLogin = page.getByRole('button', { name: 'Login' }).describe("Login Button");
    }

    public async verifyLoginPageDisplayed() {
        await expect(this.hdrLogin).toBeVisible();
        console.log("Login page is displayed");
    }

    public async enterUserName(userName: string) {
        await this.txtUserName.fill(userName);
        console.log("Entered username on " + this.txtUserName.description());
    }

    // The password value is never logged.
    public async enterPassword(password: string) {
        await this.txtPassword.fill(password);
        console.log("Entered password on " + this.txtPassword.description());
    }

    public async clickOnLogin() {
        await this.btnLogin.click();
        console.log("Clicked on " + this.btnLogin.description());
    }

    public async performLogin(userName: string, password: string) {
        await this.enterUserName(userName);
        await this.enterPassword(password);
        await this.clickOnLogin();
    }
}

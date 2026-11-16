import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

// The page shown after an employee is saved: /pim/viewPersonalDetails/empNumber/N
export class PersonalDetailsPage extends BasePage {

    private hdrPersonalDetails: Locator;
    private txtFirstName: Locator;
    private txtMiddleName: Locator;
    private txtLastName: Locator;
    private btnSave: Locator;
    private msgToast: Locator;

    // Saving an employee is slow in this app, so the first waits get more than the default 5 seconds.
    private slowTimeout = 20000;

    constructor(page: Page) {
        super(page);
        this.hdrPersonalDetails = page.getByRole('heading', { name: 'Personal Details' }).describe("Personal Details Header");
        this.txtFirstName = page.getByPlaceholder('First Name').describe("First Name Textbox");
        this.txtMiddleName = page.getByPlaceholder('Middle Name').describe("Middle Name Textbox");
        this.txtLastName = page.getByPlaceholder('Last Name').describe("Last Name Textbox");
        // The page has more than one form; the first Save button saves the name section.
        this.btnSave = page.getByRole('button', { name: 'Save' }).first().describe("Personal Details Save Button");
        this.msgToast = page.locator('.oxd-toast').describe("Toast Message");
    }

    // The form fills its values a moment AFTER the heading appears.
    // Wait for the first name too, or a value typed now gets overwritten.
    public async waitForEmployeeLoaded(firstName: string) {
        await expect(this.hdrPersonalDetails).toBeVisible({ timeout: this.slowTimeout });
        await expect(this.txtFirstName).toHaveValue(firstName, { timeout: this.slowTimeout });
        console.log("Personal Details page is displayed for " + firstName);
    }

    public async verifyName(firstName: string, lastName: string) {
        await expect(this.txtFirstName).toHaveValue(firstName);
        await expect(this.txtLastName).toHaveValue(lastName);
        console.log("Verified name " + firstName + " " + lastName);
    }

    public async enterMiddleName(middleName: string) {
        await this.txtMiddleName.fill(middleName);
        console.log("Entered " + middleName + " on " + this.txtMiddleName.description());
    }

    public async clickOnSave() {
        await this.btnSave.click();
        console.log("Clicked on " + this.btnSave.description());
    }

    public async verifyMessage(message: string) {
        await expect(this.msgToast).toContainText(message);
        console.log("Message shown: " + message);
    }

    public async verifyMiddleName(middleName: string) {
        await expect(this.txtMiddleName).toHaveValue(middleName);
        console.log("Verified middle name " + middleName);
    }
}

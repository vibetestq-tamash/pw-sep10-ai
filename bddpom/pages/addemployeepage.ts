import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./basepage";

export class AddEmployeePage extends BasePage {

    private lnkAddEmployee: Locator;
    private hdrAddEmployee: Locator;
    private txtFirstName: Locator;
    private txtLastName: Locator;
    private btnSave: Locator;

    constructor(page: Page) {
        super(page);
        this.lnkAddEmployee = page.getByRole('link', { name: 'Add Employee' }).describe("Add Employee Link");
        this.hdrAddEmployee = page.getByRole('heading', { name: 'Add Employee' }).describe("Add Employee Header");
        this.txtFirstName = page.getByPlaceholder('First Name').describe("First Name Textbox");
        this.txtLastName = page.getByPlaceholder('Last Name').describe("Last Name Textbox");
        this.btnSave = page.getByRole('button', { name: 'Save' }).describe("Save Button");
    }

    // Opens the form from the PIM top menu.
    public async open() {
        await this.lnkAddEmployee.click();
        console.log("Clicked on " + this.lnkAddEmployee.description());
        await expect(this.hdrAddEmployee).toBeVisible();
        console.log("Add Employee page is displayed");
    }

    public async enterFirstName(firstName: string) {
        await this.txtFirstName.fill(firstName);
        console.log("Entered " + firstName + " on " + this.txtFirstName.description());
    }

    public async enterLastName(lastName: string) {
        await this.txtLastName.fill(lastName);
        console.log("Entered " + lastName + " on " + this.txtLastName.description());
    }

    public async clickOnSave() {
        await this.btnSave.click();
        console.log("Clicked on " + this.btnSave.description());
    }

    public async addEmployee(firstName: string, lastName: string) {
        await this.enterFirstName(firstName);
        await this.enterLastName(lastName);
        await this.clickOnSave();
    }
}

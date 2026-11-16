import { Given, When, Then } from '@cucumber/cucumber';
import { HrmWorld } from '../support/world';

Given('I open the Add Employee page', async function (this: HrmWorld) {
  await this.dashboardPage.clickOnPIM();
  await this.addEmployeePage.open();
});

When('I add an employee with first name {string} and last name {string}', async function (this: HrmWorld, firstName: string, lastName: string) {
  await this.addEmployeePage.addEmployee(firstName, lastName);
  await this.personalDetailsPage.waitForEmployeeLoaded(firstName);
});

Then('I should see the personal details of {string} {string}', async function (this: HrmWorld, firstName: string, lastName: string) {
  await this.personalDetailsPage.verifyName(firstName, lastName);
});

When('I change the middle name to {string} and save', async function (this: HrmWorld, middleName: string) {
  await this.personalDetailsPage.enterMiddleName(middleName);
  await this.personalDetailsPage.clickOnSave();
});

Then('I should see the message {string}', async function (this: HrmWorld, message: string) {
  await this.personalDetailsPage.verifyMessage(message);
});

Then('the middle name should be {string}', async function (this: HrmWorld, middleName: string) {
  await this.personalDetailsPage.verifyMiddleName(middleName);
});

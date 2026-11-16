import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HrmWorld } from '../support/world';

Given('I open the Add Employee page', async function (this: HrmWorld) {
  await this.page.getByRole('link', { name: 'PIM' }).click();
  await this.page.getByRole('link', { name: 'Add Employee' }).click();
  await expect(this.page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
});

When('I add an employee with first name {string} and last name {string}', async function (this: HrmWorld, firstName: string, lastName: string) {
  await this.page.getByPlaceholder('First Name').fill(firstName);
  await this.page.getByPlaceholder('Last Name').fill(lastName);
  await this.page.getByRole('button', { name: 'Save' }).click();
  await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible({ timeout: 20000 });
  // The form loads its data after the heading appears; wait so later edits are not overwritten
  await expect(this.page.getByPlaceholder('First Name')).toHaveValue(firstName, { timeout: 20000 });
});

Then('I should see the personal details of {string} {string}', async function (this: HrmWorld, firstName: string, lastName: string) {
  await expect(this.page.getByPlaceholder('First Name')).toHaveValue(firstName);
  await expect(this.page.getByPlaceholder('Last Name')).toHaveValue(lastName);
});

When('I change the middle name to {string} and save', async function (this: HrmWorld, middleName: string) {
  await this.page.getByPlaceholder('Middle Name').fill(middleName);
  await this.page.getByRole('button', { name: 'Save' }).first().click();
});

Then('I should see the message {string}', async function (this: HrmWorld, message: string) {
  await expect(this.page.locator('.oxd-toast')).toContainText(message);
});

Then('the middle name should be {string}', async function (this: HrmWorld, middleName: string) {
  await expect(this.page.getByPlaceholder('Middle Name')).toHaveValue(middleName);
});

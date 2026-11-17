import { When, Then } from '@cucumber/cucumber';
import { PSWorld, expect } from '../../support/world';

// ─── Personal Details Page Locators ────────────────────────────────────────
const firstNameInput  = (w: PSWorld) => w.page.getByPlaceholder('First Name').describe('First name input field');
const middleNameInput = (w: PSWorld) => w.page.getByPlaceholder('Middle Name').describe('Middle name input field');
const lastNameInput   = (w: PSWorld) => w.page.getByPlaceholder('Last Name').describe('Last name input field');
// The page has one Save button per section; the first one saves Personal Details
const saveButton      = (w: PSWorld) => w.page.getByRole('button', { name: 'Save' }).first().describe('Personal Details save button');
const toastMessage    = (w: PSWorld) => w.page.locator('.oxd-toast').describe('Notification toast');

// ─── Personal Details Page Steps ───────────────────────────────────────────
Then('I should see the personal details of {string} {string}', async function (this: PSWorld, firstName: string, lastName: string) {
  await expect(firstNameInput(this)).toHaveValue(firstName);
  await expect(lastNameInput(this)).toHaveValue(lastName);
});

When('I change the middle name to {string} and save', async function (this: PSWorld, middleName: string) {
  await middleNameInput(this).fill(middleName);
  await saveButton(this).click();
});

Then('I should see the message {string}', async function (this: PSWorld, message: string) {
  await expect(toastMessage(this)).toContainText(message);
});

Then('the middle name should be {string}', async function (this: PSWorld, middleName: string) {
  await expect(middleNameInput(this)).toHaveValue(middleName);
});

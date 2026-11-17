import { Given, When } from '@cucumber/cucumber';
import { PSWorld, expect } from '../../support/world';

// ─── Add Employee Page Locators ────────────────────────────────────────────
const pimLink                = (w: PSWorld) => w.page.getByRole('link', { name: 'PIM' }).describe('PIM menu link');
const addEmployeeLink        = (w: PSWorld) => w.page.getByRole('link', { name: 'Add Employee' }).describe('Add Employee tab link');
const addEmployeeHeading     = (w: PSWorld) => w.page.getByRole('heading', { name: 'Add Employee' }).describe('Add Employee form heading');
const firstNameInput         = (w: PSWorld) => w.page.getByPlaceholder('First Name').describe('First name input field');
const lastNameInput          = (w: PSWorld) => w.page.getByPlaceholder('Last Name').describe('Last name input field');
const saveButton             = (w: PSWorld) => w.page.getByRole('button', { name: 'Save' }).describe('Save employee button');
const personalDetailsHeading = (w: PSWorld) => w.page.getByRole('heading', { name: 'Personal Details' }).describe('Personal Details page heading');

// ─── Add Employee Page Steps ───────────────────────────────────────────────
Given('I open the Add Employee page', async function (this: PSWorld) {
  await pimLink(this).click();
  await addEmployeeLink(this).click();
  await expect(addEmployeeHeading(this)).toBeVisible();
});

When('I add an employee with first name {string} and last name {string}', async function (this: PSWorld, firstName: string, lastName: string) {
  await firstNameInput(this).fill(firstName);
  await lastNameInput(this).fill(lastName);
  await saveButton(this).click();
  // Saving opens Personal Details; its form fills in after the heading appears,
  // so wait for the first name too, or a later edit gets overwritten.
  await expect(personalDetailsHeading(this)).toBeVisible();
  await expect(firstNameInput(this)).toHaveValue(firstName);
});

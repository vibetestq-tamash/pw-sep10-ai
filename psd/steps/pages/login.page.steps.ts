import { Given, When, Then } from '@cucumber/cucumber';
import { PSWorld, expect } from '../../support/world';

// ─── Login Page Locators ───────────────────────────────────────────────────
const loginHeading  = (w:PSWorld)=>w.page.getByRole('heading', { name: 'Login' }).describe('Login page heading');
const usernameInput = (w: PSWorld) => w.page.getByRole('textbox', { name: 'Username' }).describe('Username input field');
const passwordInput = (w: PSWorld) => w.page.getByRole('textbox', { name: 'Password' }).describe('Password input field');
const loginButton   = (w: PSWorld) => w.page.getByRole('button', { name: 'Login' }).describe('Login submit button');

// ─── Login Page Steps ──────────────────────────────────────────────────────
Given('I navigate to hrm login page', async function (this: PSWorld) {
  await this.page.goto('/');
  await expect(loginHeading(this)).toBeVisible();
});

Then('I should see the login page', async function (this: PSWorld) {
  await expect(loginHeading(this)).toBeVisible();
});

When('I enter valid username as {string} and password as {string}', async function (this: PSWorld, username: string, password: string) {
  await usernameInput(this).fill(username);
  await passwordInput(this).fill(password);
});

When('I click on the login button', async function (this: PSWorld) {
  await loginButton(this).click();
  // no assertion — the Then step that follows verifies the outcome
});

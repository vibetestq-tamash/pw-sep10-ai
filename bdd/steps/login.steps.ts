import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginWorld } from '../support/world';

Given('I navigate to hrm login page', async function (this: LoginWorld) {
  await this.launch();
  await this.page.goto('https://qtpsudhakar-vibetestq-hrm.up.railway.app/');
});

Then('I should see the login page', async function (this: LoginWorld) {
  await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

When('I enter valid username as {string} and password as {string}', async function (this: LoginWorld, username: string, password: string) {
  await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
  await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
});

When('I click on the login button', async function (this: LoginWorld) {
  await this.page.getByRole('button', { name: 'Login' }).click();
});

Then('I should be redirected to the dashboard page', async function (this: LoginWorld) {
  await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

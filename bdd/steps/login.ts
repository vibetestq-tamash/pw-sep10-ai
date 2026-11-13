import { Browser, chromium, Page, BrowserContext } from 'playwright';
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

let browser:Browser;
let context: BrowserContext;
let page: Page;

Given('I navigate to hrm login page', async function () {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto('https://qtpsudhakar-vibetestq-hrm.up.railway.app/'); // Replace with actual login page URL
});

Then('I should see the login page', async function () {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

When('I enter valid username as {string} and password as {string}', async function (username, password) {
  await page.getByRole('textbox', { name: 'Username' }).fill(username); // Replace with actual selector
  await page.getByRole('textbox', { name: 'Password' }).fill(password); // Replace with actual selector
});

When('I click on the login button', async function () {
  await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual selector
});

Then('I should be redirected to the dashboard page', async function () {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await browser.close();
});

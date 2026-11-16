import { Given, When, Then } from '@cucumber/cucumber';
import { HrmWorld } from '../support/world';

Given('I navigate to hrm login page', async function (this: HrmWorld) {
  await this.loginPage.navigateTo('https://qtpsudhakar-vibetestq-hrm.up.railway.app/');
});

Then('I should see the login page', async function (this: HrmWorld) {
  await this.loginPage.verifyLoginPageDisplayed();
});

When('I enter valid username as {string} and password as {string}', async function (this: HrmWorld, username: string, password: string) {
  await this.loginPage.enterUserName(username);
  await this.loginPage.enterPassword(password);
});

When('I click on the login button', async function (this: HrmWorld) {
  await this.loginPage.clickOnLogin();
});

Then('I should be redirected to the dashboard page', async function (this: HrmWorld) {
  await this.dashboardPage.verifyDashboardDisplayed();
});

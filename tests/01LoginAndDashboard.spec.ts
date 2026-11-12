// spec: standard example. Shows the required test shape.
// Covers: login with valid credentials lands on the dashboard, then logout.

import { test } from "../fixtures/appbase";
import { appUrl } from "../testdata/app";

test.describe('Login - Smoke', () => {

    test.beforeEach(async ({ App }) => {
        // Open the application and reach the login page
        await App.basePage.navigateTo(appUrl);
        await App.loginPage.verifyLoginPageDisplayed();
    });

    test('Valid user can log in and reach the dashboard', { tag: ['@smoke'] }, async ({ App, testData }) => {
        // Step 1: Log in with the configured test user
        await App.loginPage.performLogin(testData.username, testData.password);

        // Step 2: Verify the dashboard is shown
        await App.dashboardPage.verifyDashboardDisplayed();
    });

    test('Logged-in user can log out', async ({ App, testData }) => {
        // Step 1: Log in
        await App.loginPage.performLogin(testData.username, testData.password);
        await App.dashboardPage.verifyDashboardDisplayed();

        // Step 2: Log out and verify the login page is shown again
        await App.dashboardPage.clickOnLogout();
        await App.loginPage.verifyLoginPageDisplayed();
    });
});

import { test as base } from "@playwright/test";

import * as pages from "../pom";
import { testData } from "../testdata/creds";

// Add one entry per page class. Keys are used in tests as App.<key>.
type tPages = {
    basePage: pages.BasePage;
    loginPage: pages.LoginPage;
    dashboardPage: pages.DashboardPage;
};

export const test = base.extend<
    { App: tPages; testData: typeof testData },
    { bAll: void }
>({
    // App: all page objects, created once per test.
    App: async ({ page }, use) => {
        await use({
            basePage: new pages.BasePage(page),
            loginPage: new pages.LoginPage(page),
            dashboardPage: new pages.DashboardPage(page),
        });
    },

    // testData: credentials from environment variables.
    testData: async ({ }, use, testInfo) => {
        console.log("Test data loaded for test: " + testInfo.title);
        await use(testData);
    },

    // bAll: worker-scoped setup and teardown, runs automatically.
    bAll: [async ({ }, use, workerInfo) => {
        console.log("Worker " + workerInfo.workerIndex + " started");
        await use();
        console.log("Worker " + workerInfo.workerIndex + " finished");
    }, { scope: "worker", auto: true }],
});

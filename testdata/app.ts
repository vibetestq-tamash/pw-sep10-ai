// Application under test. Set APP_URL in .env (or the shell). No URL is hardcoded in tests.
export const appUrl = (() => {
    const url = process.env.APP_URL;
    if (!url) {
        throw new Error("APP_URL is not set. Copy .env.example to .env and set APP_URL.");
    }
    return url;
})();

// Credentials come only from environment variables. Never hardcode them here.
// Set APP_USER and APP_PASSWORD in .env (or the shell).
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not set. Copy .env.example to .env and set it.`);
    }
    return value;
}

export const testData = {
    username: requireEnv("APP_USER"),
    password: requireEnv("APP_PASSWORD"),
};

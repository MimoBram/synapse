// Dummy env vars so src/config/env.ts doesn't throw on import during tests.
// dotenv.config() (called inside env.ts) never overwrites vars already set,
// so these values win even if a real server/.env is also present.
process.env.SUPABASE_URL ??= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";
process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.PORT ??= "3000";

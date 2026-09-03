import { defineConfig } from 'drizzle-kit';

// Migrations are generated here with `pnpm db:generate` and applied with wrangler
// (`pnpm db:migrate:local` / `pnpm db:migrate:remote`), so no credentials are needed.
export default defineConfig({
    dialect: 'sqlite',
    driver: 'd1-http',
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    strict: true,
    verbose: true,
});

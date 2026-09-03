// drizzle-kit v1 writes one folder per migration (drizzle/<stamp>_<name>/migration.sql).
import console from 'node:console';
// wrangler applies flat *.sql files from migrations_dir, so mirror them into ./migrations.
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const src = 'drizzle';
const out = 'migrations';
mkdirSync(out, { recursive: true });

let copied = 0;
for (const dir of readdirSync(src).sort()) {
    const folder = join(src, dir);
    const file = join(folder, 'migration.sql');
    if (!statSync(folder).isDirectory() || !existsSync(file)) continue;
    const target = join(out, `${dir}.sql`);
    if (!existsSync(target)) {
        copyFileSync(file, target);
        copied++;
        console.log(`+ ${target}`);
    }
}
console.log(copied ? `${copied} migration(s) synced` : 'migrations up to date');

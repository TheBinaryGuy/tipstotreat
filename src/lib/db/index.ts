import * as schema from '@/lib/db/schema';
import { drizzle } from 'drizzle-orm/d1';
import { env } from 'cloudflare:workers';

let instance: ReturnType<typeof createDb> | undefined;

function createDb() {
    return drizzle(env.DB);
}

/** The D1-backed Drizzle client. Server-only: never import from client code. */
export function getDb() {
    instance ??= createDb();
    return instance;
}

export type Db = ReturnType<typeof getDb>;
export { schema };

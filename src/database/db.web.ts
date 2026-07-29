import type { DatabaseBase, DBBindValue } from "./db.types";
import { createWebDb } from "./webDb";

let dbInstance: DatabaseBase | null = null;
let initializing = false;

export async function getDb(): Promise<DatabaseBase> {
	if (dbInstance) return dbInstance;

	if (initializing) {
		await new Promise<void>(resolve => {
			const check = setInterval(() => {
				if (!initializing) {
					clearInterval(check);
					resolve();
				}
			}, 100);
		});
		return dbInstance!;
	}

	initializing = true;
	try {
		dbInstance = createWebDb();
		return dbInstance;
	} finally {
		initializing = false;
	}
}

export async function closeDb(): Promise<void> {
	if (dbInstance) {
		await dbInstance.closeAsync();
		dbInstance = null;
	}
}

export async function runInTransaction<T>(callback: (database: DatabaseBase) => Promise<T>): Promise<T> {
	const database = await getDb();
	await database.execAsync("BEGIN TRANSACTION;");
	try {
		const result = await callback(database);
		await database.execAsync("COMMIT;");
		return result;
	} catch (error) {
		await database.execAsync("ROLLBACK;");
		throw error;
	}
}

export async function runQuery<T>(sql: string, params: DBBindValue[] = []): Promise<T[]> {
	const database = await getDb();
	return database.getAllAsync<T>(sql, params);
}

export async function runQueryFirst<T>(sql: string, params: DBBindValue[] = []): Promise<T | null> {
	const database = await getDb();
	return database.getFirstAsync<T>(sql, params);
}

export async function runExec(sql: string, params: DBBindValue[] = []): Promise<void> {
	const database = await getDb();
	await database.runAsync(sql, params);
}

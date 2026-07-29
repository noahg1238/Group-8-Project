import * as SQLite from "expo-sqlite";
import type { DatabaseBase, DBBindValue } from "./db.types";

let dbInstance: DatabaseBase | null = null;
let initializing = false;

async function getNativeDb(): Promise<DatabaseBase> {
	const db = await SQLite.openDatabaseAsync("planb.db");
	await db.execAsync("PRAGMA foreign_keys = ON;");
	return db as DatabaseBase;
}

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
		dbInstance = await getNativeDb();
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

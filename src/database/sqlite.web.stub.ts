// Web stub — native SQLite is not used; see db.web.ts + webDb.ts
export async function openDatabaseAsync(): Promise<never> {
	throw new Error("expo-sqlite is not available on web");
}

export async function openDatabaseSync(): Promise<never> {
	throw new Error("expo-sqlite is not available on web");
}

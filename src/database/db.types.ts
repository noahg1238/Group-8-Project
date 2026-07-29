// Shared database types for native and web implementations

export type DBBindValue = string | number | null;

export interface DatabaseBase {
	execAsync: (sql: string) => Promise<void>;
	getAllAsync: <T>(sql: string, params?: DBBindValue[]) => Promise<T[]>;
	getFirstAsync: <T>(sql: string, params?: DBBindValue[]) => Promise<T | null>;
	runAsync: (sql: string, params?: DBBindValue[]) => Promise<{ changes: number; lastInsertRowId: number }>;
	closeAsync: () => Promise<void>;
}

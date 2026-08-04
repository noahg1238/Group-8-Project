import * as SQLite from "expo-sqlite";
import type { DatabaseBase, DBBindValue } from "./db.types";

let dbInstance: DatabaseBase | null = null;
let initializing = false;

async function ensureSchema(database: DatabaseBase): Promise<void> {
  await database.execAsync(`
		PRAGMA foreign_keys = ON;
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY DEFAULT 'default_user',
			has_password INTEGER DEFAULT 0,
			passkey_hash TEXT,
			password_hash TEXT,
			password_salt TEXT,
			created_at TEXT DEFAULT (datetime('now'))
		);
		CREATE TABLE IF NOT EXISTS events (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			location TEXT,
			latitude REAL,
			longitude REAL,
			start_date TEXT NOT NULL,
			end_date TEXT,
			all_day INTEGER DEFAULT 0,
			color TEXT DEFAULT '#007AFF',
			notes TEXT,
			created_at TEXT DEFAULT (datetime('now')),
			updated_at TEXT DEFAULT (datetime('now'))
		);
		CREATE TABLE IF NOT EXISTS event_recurrence (
			id TEXT PRIMARY KEY,
			event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
			recurrence_rule TEXT NOT NULL,
			end_date TEXT,
			created_at TEXT DEFAULT (datetime('now'))
		);
		CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL,
			updated_at TEXT DEFAULT (datetime('now'))
		);
		CREATE TABLE IF NOT EXISTS schema_version (
			id INTEGER PRIMARY KEY CHECK (id = 1),
			version INTEGER NOT NULL DEFAULT 0
		);
		CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
		CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
		CREATE INDEX IF NOT EXISTS idx_event_recurrence_event_id ON event_recurrence(event_id);
		INSERT OR IGNORE INTO users (id, has_password) VALUES ('default_user', 0);
		INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES
			('defaultView', 'month', datetime('now')),
			('theme', 'system', datetime('now')),
			('firstDayOfWeek', '0', datetime('now')),
			('showWeekNumbers', '0', datetime('now')),
			('enableNotifications', '1', datetime('now'));
	`);
}

async function getNativeDb(): Promise<DatabaseBase> {
  const db = await SQLite.openDatabaseAsync("planb.db");
  await ensureSchema(db as DatabaseBase);
  return db as DatabaseBase;
}

export async function getDb(): Promise<DatabaseBase> {
  if (dbInstance) return dbInstance;

  if (initializing) {
    await new Promise<void>((resolve) => {
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

export async function runInTransaction<T>(
  callback: (database: DatabaseBase) => Promise<T>,
): Promise<T> {
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

export async function runQuery<T>(
  sql: string,
  params: DBBindValue[] = [],
): Promise<T[]> {
  const database = await getDb();
  return database.getAllAsync<T>(sql, params);
}

export async function runQueryFirst<T>(
  sql: string,
  params: DBBindValue[] = [],
): Promise<T | null> {
  const database = await getDb();
  return database.getFirstAsync<T>(sql, params);
}

export async function runExec(
  sql: string,
  params: DBBindValue[] = [],
): Promise<void> {
  const database = await getDb();
  await database.runAsync(sql, params);
}

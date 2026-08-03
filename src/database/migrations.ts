import { getDb, runExec } from "./db";

const MIGRATION_001 = `
-- Initial database schema for PlanB

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
`;

const MIGRATIONS = [MIGRATION_001];

class MigrationRunnerImpl {
  private static instance: MigrationRunnerImpl;
  private currentVersion: number = 0;

  private constructor() {}

  public static getInstance(): MigrationRunnerImpl {
    if (!MigrationRunnerImpl.instance) {
      MigrationRunnerImpl.instance = new MigrationRunnerImpl();
    }
    return MigrationRunnerImpl.instance;
  }

  async initialize(): Promise<void> {
    const db = await getDb();

    // Create migrations table if not exists
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO schema_version (id, version) VALUES (1, 0);
    `);

    // Get current version
    const result = await db.getFirstAsync<{ version: number }>(
      "SELECT version FROM schema_version WHERE id = 1",
    );
    this.currentVersion = result?.version ?? 0;

    // Run migrations
    if (this.currentVersion < MIGRATIONS.length) {
      for (let i = this.currentVersion; i < MIGRATIONS.length; i++) {
        await runExec(MIGRATIONS[i]);
        await db.runAsync(
          "UPDATE schema_version SET version = ? WHERE id = 1",
          [i + 1],
        );
        this.currentVersion = i + 1;
      }
    }
  }

  async getCurrentVersion(): Promise<number> {
    return this.currentVersion;
  }
}

export const migrationRunner = MigrationRunnerImpl.getInstance();

let initializationPromise: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = migrationRunner
      .initialize()
      .catch((error) => {
        console.error("[Database] Initialization failed:", error);
        throw error;
      })
      .finally(() => {
        initializationPromise = null;
      });
  }

  return initializationPromise;
}

export async function getDatabase(): Promise<any> {
  return getDb();
}

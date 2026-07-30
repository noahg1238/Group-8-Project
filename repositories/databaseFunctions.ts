import * as SQLite from "expo-sqlite";

type CountRow = { count: number };
type PasswordRow = { id: number; password: string };

let _db: SQLite.SQLiteDatabase | null = null;

async function getDB() {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync("my.db");
  }
  return _db;
}

export async function tableExists() {
  const db = await getDB();
  const row = await db.getFirstAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='user_password'",
  );
  return row;
}

export async function setup() {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_password (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT
    );
  `);
}

export async function setPassword(newPassword: string) {
  const db = await getDB();
  const row = (await db.getFirstAsync(
    "SELECT COUNT(*) AS count FROM user_password",
  )) as CountRow;

  if (row.count > 0) {
    const currRow = (await db.getFirstAsync(
      "SELECT * FROM user_password",
    )) as PasswordRow;

    if (newPassword != currRow.password) {
      await db.runAsync("UPDATE user_password SET password = ? WHERE id = ?", [
        newPassword,
        currRow.id,
      ]);
    }
  } else {
    await db.runAsync("INSERT INTO user_password (password) VALUES (?)", [
      newPassword,
    ]);
  }
}

export async function getPassword(): Promise<string | null> {
  const db = await getDB();
  const row = (await db.getFirstAsync(
    "SELECT password FROM user_password",
  )) as { password: string } | null;

  return row ? row.password : null;
}

export async function hasPassword() {
  const db = await getDB();
  const row = (await db.getFirstAsync(
    "SELECT COUNT(*) AS count FROM user_password",
  )) as CountRow;

  return row.count > 0;
}

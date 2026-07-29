import type { DatabaseBase, DBBindValue } from "./db.types";
import type { DatabaseEventRow, Event } from "./types";

const EVENTS_KEY = "planb-web-events";
const SCHEMA_VERSION_KEY = "planb-web-schema-version";

function loadEvents(): DatabaseEventRow[] {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(EVENTS_KEY);
		return raw ? (JSON.parse(raw) as DatabaseEventRow[]) : [];
	} catch {
		return [];
	}
}

function saveEvents(events: DatabaseEventRow[]): void {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function mapRowToEvent(row: DatabaseEventRow): Event {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		location: row.location,
		latitude: row.latitude,
		longitude: row.longitude,
		startDate: row.start_date,
		endDate: row.end_date,
		allDay: Boolean(row.all_day),
		color: row.color,
		notes: row.notes,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

export function readEventsForMonth(year: number, month: number): Event[] {
	if (typeof localStorage === "undefined") return [];

	try {
		return loadEvents()
			.map(mapRowToEvent)
			.filter(event => {
				const eventDate = new Date(event.startDate);
				return eventDate.getFullYear() === year && eventDate.getMonth() === month;
			});
	} catch {
		return [];
	}
}

export function readAllEvents(): Event[] {
	if (typeof localStorage === "undefined") return [];
	try {
		return loadEvents().map(mapRowToEvent);
	} catch {
		return [];
	}
}

function getSchemaVersion(): number {
	if (typeof localStorage === "undefined") return 0;
	const raw = localStorage.getItem(SCHEMA_VERSION_KEY);
	return raw ? Number(raw) : 0;
}

function setSchemaVersion(version: number): void {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(SCHEMA_VERSION_KEY, String(version));
}

function matchesDateRange(row: DatabaseEventRow, start: string, end: string): boolean {
	const startDate = row.start_date;
	const endDate = row.end_date ?? row.start_date;
	return (startDate >= start && startDate <= end) || (endDate >= start && endDate <= end) || (startDate <= start && endDate >= end);
}

export function createWebDb(): DatabaseBase {
	return {
		execAsync: async (sql: string) => {
			if (sql.includes("schema_version")) {
				if (getSchemaVersion() === 0) {
					setSchemaVersion(0);
				}
			}
		},

		getAllAsync: async <T>(sql: string, params: DBBindValue[] = []): Promise<T[]> => {
			const normalized = sql.replace(/\s+/g, " ").trim().toUpperCase();

			if (normalized.startsWith("SELECT * FROM EVENTS")) {
				let results = [...loadEvents()];

				if (normalized.includes("LIKE")) {
					const term = String(params[0] ?? "")
						.replace(/%/g, "")
						.toLowerCase();
					results = results.filter(row => row.title.toLowerCase().includes(term) || (row.description?.toLowerCase().includes(term) ?? false) || (row.location?.toLowerCase().includes(term) ?? false) || (row.notes?.toLowerCase().includes(term) ?? false));
				} else if (normalized.includes("START_DATE >=")) {
					const [start, end] = params.map(String);
					results = results.filter(row => matchesDateRange(row, start, end));
				}

				results.sort((a, b) => a.start_date.localeCompare(b.start_date));
				return results as T[];
			}

			return [];
		},

		getFirstAsync: async <T>(sql: string, params: DBBindValue[] = []): Promise<T | null> => {
			const normalized = sql.replace(/\s+/g, " ").trim().toUpperCase();

			if (normalized.includes("SCHEMA_VERSION")) {
				return { version: getSchemaVersion() } as T;
			}

			if (normalized.includes("FROM EVENTS") && normalized.includes("ID =")) {
				const id = String(params[0]);
				const row = loadEvents().find(event => event.id === id);
				return (row ?? null) as T | null;
			}

			return null;
		},

		runAsync: async (sql: string, params: DBBindValue[] = []) => {
			const normalized = sql.replace(/\s+/g, " ").trim().toUpperCase();

			if (normalized.startsWith("INSERT INTO EVENTS")) {
				const row: DatabaseEventRow = {
					id: String(params[0]),
					title: String(params[1]),
					description: params[2] != null ? String(params[2]) : null,
					location: params[3] != null ? String(params[3]) : null,
					latitude: params[4] != null ? Number(params[4]) : null,
					longitude: params[5] != null ? Number(params[5]) : null,
					start_date: String(params[6]),
					end_date: params[7] != null ? String(params[7]) : null,
					all_day: Number(params[8] ?? 0),
					color: String(params[9] ?? "#007AFF"),
					notes: params[10] != null ? String(params[10]) : null,
					created_at: String(params[11]),
					updated_at: String(params[12])
				};
				const events = [...loadEvents(), row];
				saveEvents(events);
				return { changes: 1, lastInsertRowId: events.length };
			}

			if (normalized.startsWith("UPDATE EVENTS SET")) {
				const id = String(params[params.length - 1]);
				const events = [...loadEvents()];
				const index = events.findIndex(event => event.id === id);
				if (index === -1) return { changes: 0, lastInsertRowId: 0 };

				const row = { ...events[index] };
				const fieldMap: Record<string, keyof DatabaseEventRow> = {
					title: "title",
					description: "description",
					location: "location",
					latitude: "latitude",
					longitude: "longitude",
					start_date: "start_date",
					end_date: "end_date",
					all_day: "all_day",
					color: "color",
					notes: "notes",
					updated_at: "updated_at"
				};

				const setClause = sql.match(/SET (.+?) WHERE/i)?.[1] ?? "";
				const assignments = setClause.split(",").map(part => part.trim());

				assignments.forEach((assignment, i) => {
					const field = assignment.split("=")[0].trim().toLowerCase();
					const key = fieldMap[field];
					if (!key) return;
					const value = params[i];
					if (key === "latitude" || key === "longitude") {
						(row as any)[key] = value != null ? Number(value) : null;
					} else if (key === "all_day") {
						row.all_day = Number(value);
					} else {
						(row as any)[key] = value != null ? String(value) : null;
					}
				});

				events[index] = row;
				saveEvents(events);
				return { changes: 1, lastInsertRowId: 0 };
			}

			if (normalized.startsWith("DELETE FROM EVENTS")) {
				const id = String(params[0]);
				const events = loadEvents();
				const before = events.length;
				const nextEvents = events.filter(event => event.id !== id);
				saveEvents(nextEvents);
				return { changes: before - nextEvents.length, lastInsertRowId: 0 };
			}

			if (normalized.startsWith("UPDATE SCHEMA_VERSION")) {
				setSchemaVersion(Number(params[0]));
				return { changes: 1, lastInsertRowId: 0 };
			}

			return { changes: 0, lastInsertRowId: 0 };
		},

		closeAsync: async () => {}
	};
}

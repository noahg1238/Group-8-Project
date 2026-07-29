import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";
import { runExec, runInTransaction, runQuery, runQueryFirst } from "./db";
import type { DBBindValue } from "./db.types";
import type { CreateEventInput, DatabaseEventRow, Event, UpdateEventInput } from "./types";

function generateId(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function mapEventRow(row: DatabaseEventRow): Event {
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

export async function createEvent(input: CreateEventInput): Promise<Event> {
	const id = generateId();
	const now = new Date().toISOString();
	const endDate = input.endDate ?? input.startDate;

	await runExec(
		`INSERT INTO events (
      id, title, description, location, latitude, longitude,
      start_date, end_date, all_day, color, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[id, input.title, input.description ?? null, input.location ?? null, input.latitude ?? null, input.longitude ?? null, input.startDate.toISOString(), endDate.toISOString(), input.allDay ? 1 : 0, input.color ?? "#007AFF", input.notes ?? null, now, now]
	);

	const row = await runQueryFirst<DatabaseEventRow>("SELECT * FROM events WHERE id = ?", [id]);
	if (!row) throw new Error("Failed to create event");
	return mapEventRow(row);
}

export async function getEventById(id: string): Promise<Event | null> {
	const row = await runQueryFirst<DatabaseEventRow>("SELECT * FROM events WHERE id = ?", [id]);
	return row ? mapEventRow(row) : null;
}

export async function getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
	const start = startDate.toISOString();
	const end = endDate.toISOString();

	const rows = await runQuery<DatabaseEventRow>(
		`SELECT * FROM events 
    WHERE (
      (start_date >= ? AND start_date <= ?) OR
      (end_date >= ? AND end_date <= ?) OR
      (start_date <= ? AND end_date >= ?)
    )
    ORDER BY start_date, created_at`,
		[start, end, start, end, start, end]
	);

	return rows.map(mapEventRow);
}

export async function getEventsByMonth(year: number, month: number): Promise<Event[]> {
	const startDate = new Date(year, month, 1);
	const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
	return getEventsByDateRange(startDate, endDate);
}

export async function getEventsByDay(date: Date): Promise<Event[]> {
	const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
	return getEventsByDateRange(startDate, endDate);
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<Event> {
	const now = new Date().toISOString();
	const updates: string[] = [];
	const params: DBBindValue[] = [];

	if (input.title !== undefined) {
		updates.push("title = ?");
		params.push(input.title);
	}
	if (input.description !== undefined) {
		updates.push("description = ?");
		params.push(input.description);
	}
	if (input.location !== undefined) {
		updates.push("location = ?");
		params.push(input.location);
	}
	if (input.latitude !== undefined) {
		updates.push("latitude = ?");
		params.push(input.latitude);
	}
	if (input.longitude !== undefined) {
		updates.push("longitude = ?");
		params.push(input.longitude);
	}
	if (input.startDate !== undefined) {
		updates.push("start_date = ?");
		params.push(input.startDate.toISOString());
	}
	if (input.endDate !== undefined) {
		updates.push("end_date = ?");
		params.push(input.endDate.toISOString());
	}
	if (input.allDay !== undefined) {
		updates.push("all_day = ?");
		params.push(input.allDay ? 1 : 0);
	}
	if (input.color !== undefined) {
		updates.push("color = ?");
		params.push(input.color);
	}
	if (input.notes !== undefined) {
		updates.push("notes = ?");
		params.push(input.notes);
	}

	if (updates.length === 0) throw new Error("No updates provided");

	updates.push("updated_at = ?");
	params.push(now, id);

	await runExec(`UPDATE events SET ${updates.join(", ")} WHERE id = ?`, params);

	const row = await getEventById(id);
	if (!row) throw new Error("Event not found");
	return row;
}

export async function deleteEvent(id: string): Promise<void> {
	await runInTransaction(async () => {
		await runExec("DELETE FROM event_recurrence WHERE event_id = ?", [id]);
		await runExec("DELETE FROM events WHERE id = ?", [id]);
	});
}

export async function searchEvents(query: string): Promise<Event[]> {
	const searchTerm = `%${query}%`;
	const rows = await runQuery<DatabaseEventRow>(
		`SELECT * FROM events 
    WHERE title LIKE ? OR description LIKE ? OR location LIKE ? OR notes LIKE ?
    ORDER BY start_date DESC
    LIMIT 50`,
		[searchTerm, searchTerm, searchTerm, searchTerm]
	);
	return rows.map(mapEventRow);
}

export async function getAllEvents(): Promise<Event[]> {
	const rows = await runQuery<DatabaseEventRow>("SELECT * FROM events ORDER BY start_date DESC");
	return rows.map(mapEventRow);
}

export async function getRecurringEvents(): Promise<Event[]> {
	const rows = await runQuery<DatabaseEventRow>(
		`SELECT e.* FROM events e
    INNER JOIN event_recurrence r ON e.id = r.event_id
    ORDER BY e.start_date`
	);
	return rows.map(mapEventRow);
}

// React Query hooks — invalidate ["events"] keys after mutations

export function useEventsByMonth(year: number, month: number) {
	return useQuery({
		queryKey: ["events", "month", year, month],
		queryFn: () => getEventsByMonth(year, month),
		staleTime: 1000 * 60 * 5,
		refetchOnMount: "always",
		enabled: Platform.OS !== "web" || typeof window !== "undefined"
	});
}

export function useEventsByDateRange(startDate: Date, endDate: Date) {
	return useQuery({
		queryKey: ["events", "range", startDate.toISOString(), endDate.toISOString()],
		queryFn: () => getEventsByDateRange(startDate, endDate),
		staleTime: 1000 * 60 * 5
	});
}

export function useEventsByDay(date: Date) {
	return useQuery({
		queryKey: ["events", "day", date.toISOString()],
		queryFn: () => getEventsByDay(date),
		staleTime: 1000 * 60 * 5
	});
}

export function useEvent(id: string | null) {
	return useQuery({
		queryKey: ["event", id],
		queryFn: () => getEventById(id!),
		enabled: !!id,
		staleTime: 1000 * 60 * 5
	});
}

export function useAllEvents() {
	return useQuery({
		queryKey: ["events", "all"],
		queryFn: getAllEvents,
		staleTime: 1000 * 60 * 5
	});
}

export function useSearchEvents(query: string) {
	return useQuery({
		queryKey: ["events", "search", query],
		queryFn: () => searchEvents(query),
		enabled: query.length > 0,
		staleTime: 1000 * 60
	});
}

export function useCreateEvent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateEventInput) => createEvent(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events", "month"] });
			queryClient.invalidateQueries({ queryKey: ["events", "range"] });
		}
	});
}

export function useUpdateEvent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, updates }: { id: string; updates: UpdateEventInput }) => updateEvent(id, updates),
		onSuccess: (_event, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["event", id] });
			queryClient.invalidateQueries({ queryKey: ["events"] });
		}
	});
}

export function useDeleteEvent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteEvent(id),
		onSuccess: id => {
			queryClient.invalidateQueries({ queryKey: ["event", id] });
			queryClient.invalidateQueries({ queryKey: ["events"] });
		}
	});
}

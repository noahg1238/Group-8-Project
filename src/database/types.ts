// Core type definitions for database layer

export interface Event {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	latitude: number | null;
	longitude: number | null;
	startDate: string; // ISO 8601
	endDate: string | null; // ISO 8601 or null if same as start
	allDay: boolean;
	color: string;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface RecurrenceRule {
	id: string;
	eventId: string;
	recurrenceRule: string; // RRULE format
	endDate: string | null;
}

export interface CreateEventInput {
	title: string;
	description?: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	startDate: Date;
	endDate?: Date;
	allDay?: boolean;
	color?: string;
	notes?: string;
}

export interface UpdateEventInput {
	title?: string;
	description?: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	startDate?: Date;
	endDate?: Date;
	allDay?: boolean;
	color?: string;
	notes?: string;
}

export interface DatabaseEventRow {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	latitude: number | null;
	longitude: number | null;
	start_date: string;
	end_date: string | null;
	all_day: number; // SQLite boolean
	color: string;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface DatabaseUserRow {
	id: string;
	has_password: number;
	passkey_hash: string | null;
	created_at: string;
}

export interface DatabaseSettingsRow {
	key: string;
	value: string;
	updated_at: string;
}

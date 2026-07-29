// Calendar grid helpers — pure functions for month/year views

export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
	dayOfMonth: number;
}

export interface MonthData {
	month: number; // 0–11
	year: number;
	name: string;
	shortName: string;
	daysInMonth: number;
	firstDayOfMonth: number; // 0–6, Sunday–Saturday
}

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CURRENT_YEAR = new Date().getFullYear();
export const MIN_YEAR = CURRENT_YEAR - 25;
export const MAX_YEAR = CURRENT_YEAR + 25;

export function isValidYear(year: number): boolean {
	return year >= MIN_YEAR && year <= MAX_YEAR;
}

export function getDaysInMonth(year: number, month: number): number {
	if (!isValidYear(year) || month < 0 || month > 11) {
		throw new Error("Invalid year or month");
	}
	return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
	if (!isValidYear(year) || month < 0 || month > 11) {
		throw new Error("Invalid year or month");
	}
	return new Date(year, month, 1).getDay();
}

export function getMonthGrid(year: number, month: number): CalendarDay[][] {
	if (!isValidYear(year) || month < 0 || month > 11) {
		throw new Error("Invalid year or month");
	}

	const today = new Date();
	const grid: CalendarDay[][] = [];
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);

	const prevMonth = month === 0 ? 11 : month - 1;
	const prevYear = month === 0 ? year - 1 : year;
	const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

	const nextMonth = month === 11 ? 0 : month + 1;
	const nextYear = month === 11 ? year + 1 : year;

	let dayCounter = 1;
	let nextMonthDay = 1;

	for (let week = 0; week < 6; week++) {
		const weekDays: CalendarDay[] = [];

		for (let day = 0; day < 7; day++) {
			let date: Date;
			let isCurrentMonth = true;
			let dayOfMonth: number;

			if (week === 0 && day < firstDay) {
				const prevMonthDay = daysInPrevMonth - firstDay + day + 1;
				date = new Date(prevYear, prevMonth, prevMonthDay);
				isCurrentMonth = false;
				dayOfMonth = prevMonthDay;
			} else if (dayCounter <= daysInMonth) {
				date = new Date(year, month, dayCounter);
				isCurrentMonth = true;
				dayOfMonth = dayCounter;
				dayCounter++;
			} else {
				date = new Date(nextYear, nextMonth, nextMonthDay);
				isCurrentMonth = false;
				dayOfMonth = nextMonthDay;
				nextMonthDay++;
			}

			const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();

			weekDays.push({ date, isCurrentMonth, isToday, dayOfMonth });
		}

		grid.push(weekDays);
	}

	return grid;
}

export function getMiniCalendarCellCount(firstDayOfMonth: number, daysInMonth: number): number {
	return Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
}

export function getYearMonths(year: number): MonthData[] {
	if (!isValidYear(year)) {
		throw new Error(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}`);
	}

	const months: MonthData[] = [];

	for (let month = 0; month < 12; month++) {
		months.push({
			month,
			year,
			name: MONTH_NAMES[month],
			shortName: MONTH_SHORT_NAMES[month],
			daysInMonth: getDaysInMonth(year, month),
			firstDayOfMonth: getFirstDayOfMonth(year, month)
		});
	}

	return months;
}

export function addMonths(date: Date, months: number): Date {
	const result = new Date(date);
	const totalMonths = result.getMonth() + months;
	const yearsToAdd = Math.floor(totalMonths / 12);
	const newMonth = ((totalMonths % 12) + 12) % 12;

	result.setFullYear(result.getFullYear() + yearsToAdd);
	result.setMonth(newMonth);

	const daysInNewMonth = getDaysInMonth(result.getFullYear(), newMonth);
	if (result.getDate() > daysInNewMonth) {
		result.setDate(daysInNewMonth); // e.g. Jan 31 → Feb
	}

	return result;
}

export function addYears(date: Date, years: number): Date {
	const result = new Date(date);
	const newYear = result.getFullYear() + years;

	if (!isValidYear(newYear)) {
		throw new Error(`Resulting year ${newYear} is outside valid range`);
	}

	result.setFullYear(newYear);

	const month = result.getMonth();
	const daysInNewMonth = getDaysInMonth(newYear, month);
	if (result.getDate() > daysInNewMonth) {
		result.setDate(daysInNewMonth); // Feb 29 in non-leap years
	}

	return result;
}

export function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isToday(date: Date): boolean {
	return isSameDay(date, new Date());
}

export function formatMonthYear(date: Date): string {
	return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDayName(date: Date, short = false): string {
	const day = date.getDay();
	return short ? DAY_SHORT_NAMES[day] : DAY_NAMES[day];
}

export function getMonthShortName(month: number): string {
	if (month < 0 || month > 11) throw new Error("Invalid month");
	return MONTH_SHORT_NAMES[month];
}

export function getMonthName(month: number): string {
	if (month < 0 || month > 11) throw new Error("Invalid month");
	return MONTH_NAMES[month];
}

export function getWeekNumber(date: Date): number {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getStartOfWeek(date: Date): Date {
	const result = new Date(date);
	result.setDate(result.getDate() - result.getDay());
	result.setHours(0, 0, 0, 0);
	return result;
}

export function getEndOfWeek(date: Date): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + (6 - result.getDay()));
	result.setHours(23, 59, 59, 999);
	return result;
}

export function getStartOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function compareDates(a: Date, b: Date): number {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}

export function isValidDateRange(date: Date): boolean {
	return isValidYear(date.getFullYear());
}

const gridCache = new Map<string, CalendarDay[][]>();
const monthCache = new Map<number, MonthData[]>();

export function getMemoizedMonthGrid(year: number, month: number): CalendarDay[][] {
	const key = `${year}-${month}`;
	if (gridCache.has(key)) return gridCache.get(key)!;

	const grid = getMonthGrid(year, month);
	gridCache.set(key, grid);
	return grid;
}

export function getMemoizedYearMonths(year: number): MonthData[] {
	if (monthCache.has(year)) return monthCache.get(year)!;

	const months = getYearMonths(year);
	monthCache.set(year, months);
	return months;
}

export function clearCalendarCache(): void {
	gridCache.clear();
	monthCache.clear();
}

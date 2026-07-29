import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// SecureStore on native, localStorage on web
function createSecurePersistStorage() {
	return {
		getItem: async (name: string): Promise<string | null> => {
			try {
				if (Platform.OS === "web") {
					return typeof localStorage !== "undefined" ? localStorage.getItem(name) : null;
				}
				return await SecureStore.getItemAsync(name);
			} catch {
				return null;
			}
		},
		setItem: async (name: string, value: string): Promise<void> => {
			try {
				if (Platform.OS === "web") {
					if (typeof localStorage !== "undefined") {
						localStorage.setItem(name, value);
					}
				} else {
					await SecureStore.setItemAsync(name, value);
				}
			} catch {
				// Ignore storage errors
			}
		},
		removeItem: async (name: string): Promise<void> => {
			try {
				if (Platform.OS === "web") {
					if (typeof localStorage !== "undefined") {
						localStorage.removeItem(name);
					}
				} else {
					await SecureStore.deleteItemAsync(name);
				}
			} catch {
				// Ignore storage errors
			}
		}
	};
}

function createWebPersistStorage() {
	return {
		getItem: (name: string) => {
			if (typeof localStorage === "undefined") return null;
			return localStorage.getItem(name);
		},
		setItem: (name: string, value: string) => {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(name, value);
			}
		},
		removeItem: (name: string) => {
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem(name);
			}
		}
	};
}

// --- Auth store ---

export interface AuthState {
	hasPassword: boolean | null;
	isAuthenticated: boolean;
	setHasPassword: (has: boolean) => void;
	setAuthenticated: (auth: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			hasPassword: null,
			isAuthenticated: false,
			setHasPassword: has => set({ hasPassword: has }),
			setAuthenticated: auth => set({ isAuthenticated: auth })
		}),
		{
			name: "planb-auth-storage",
			storage: createJSONStorage(() => createSecurePersistStorage()),
			partialize: state => ({
				hasPassword: state.hasPassword,
				isAuthenticated: state.isAuthenticated
			})
		}
	)
);

// --- Calendar store ---

export interface CalendarState {
	currentDate: Date;
	viewMode: "month" | "year";
	selectedDate: Date | null;
	setCurrentDate: (date: Date) => void;
	setViewMode: (mode: "month" | "year") => void;
	setSelectedDate: (date: Date | null) => void;
	goToToday: () => void;
	nextMonth: () => void;
	previousMonth: () => void;
	nextYear: () => void;
	previousYear: () => void;
	goToMonth: (month: number, year: number) => void;
}

const MIN_YEAR = new Date().getFullYear() - 25;
const MAX_YEAR = new Date().getFullYear() + 25;

const reviveDates = (state: CalendarState): CalendarState => ({
	...state,
	currentDate: new Date(state.currentDate),
	selectedDate: state.selectedDate ? new Date(state.selectedDate) : null
});

const getCurrentDate = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const useCalendarStore = create<CalendarState>()(
	persist(
		set => ({
			currentDate: getCurrentDate(),
			viewMode: "month",
			selectedDate: getCurrentDate(),

			setCurrentDate: date => set({ currentDate: date }),
			setViewMode: mode => set({ viewMode: mode }),
			setSelectedDate: date => set({ selectedDate: date }),

			goToToday: () => {
				set({ currentDate: getCurrentDate() });
			},

			nextMonth: () =>
				set(state => {
					const next = new Date(state.currentDate);
					next.setMonth(next.getMonth() + 1);
					return next.getFullYear() > MAX_YEAR ? {} : { currentDate: next };
				}),

			previousMonth: () =>
				set(state => {
					const prev = new Date(state.currentDate);
					prev.setMonth(prev.getMonth() - 1);
					return prev.getFullYear() < MIN_YEAR ? {} : { currentDate: prev };
				}),

			nextYear: () =>
				set(state => {
					const next = new Date(state.currentDate);
					next.setFullYear(next.getFullYear() + 1);
					return next.getFullYear() > MAX_YEAR ? {} : { currentDate: next };
				}),

			previousYear: () =>
				set(state => {
					const prev = new Date(state.currentDate);
					prev.setFullYear(prev.getFullYear() - 1);
					return prev.getFullYear() < MIN_YEAR ? {} : { currentDate: prev };
				}),

			goToMonth: (month, year) => {
				if (year < MIN_YEAR || year > MAX_YEAR || month < 0 || month > 11) {
					return;
				}
				set({ currentDate: new Date(year, month, 1) });
			}
		}),
		{
			name: "planb-calendar-storage",
			storage: createJSONStorage(() => createWebPersistStorage()),
			merge: (persisted, current) => reviveDates({ ...current, ...(persisted as Partial<CalendarState>) } as CalendarState)
		}
	)
);

export const YEAR_RANGE = {
	MIN: MIN_YEAR,
	MAX: MAX_YEAR
};

// --- Settings store ---

export type TimezoneMode = "automatic" | "manual";

export interface AppSettings {
	enableNotifications: boolean;
	enableHaptics: boolean;
	timezoneMode: TimezoneMode;
	pushNotifications: boolean;
	reminders: boolean;
	autoAccept: boolean;
	autoDecline: boolean;
}

export interface SettingsState extends AppSettings {
	updateSettings: (settings: Partial<AppSettings>) => void;
	setTimezoneMode: (mode: TimezoneMode) => void;
}

const defaultSettings: AppSettings = {
	enableNotifications: true,
	enableHaptics: true,
	timezoneMode: "automatic",
	pushNotifications: true,
	reminders: false,
	autoAccept: true,
	autoDecline: false
};

export const useSettingsStore = create<SettingsState>()(
	persist(
		set => ({
			...defaultSettings,

			updateSettings: settings => {
				if (Object.keys(settings).length > 0) {
					set(state => ({
						...state,
						...settings
					}));
				}
			},

			setTimezoneMode: mode => {
				set(state => ({
					...state,
					timezoneMode: mode
				}));
			}
		}),
		{
			name: "planb-settings-storage",
			partialize: state => ({
				enableNotifications: state.enableNotifications,
				enableHaptics: state.enableHaptics,
				timezoneMode: state.timezoneMode,
				pushNotifications: state.pushNotifications,
				reminders: state.reminders,
				autoAccept: state.autoAccept,
				autoDecline: state.autoDecline
			})
		}
	)
);

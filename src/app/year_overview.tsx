import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { YearView } from "../components/calendar/YearView";
import { SearchOverlay, type SearchSuggestion } from "../components/search/SearchOverlay";
import { GlassScreen } from "../components/ui/GlassScreen";
import { GlassTopBar } from "../components/ui/GlassTopBar";
import { MotionView } from "../components/ui/MotionView";
import { getEventsByMonth } from "../database/events";
import { useCalendarStore } from "../database/stores";
import type { Event } from "../database/types";
import { readAllEvents } from "../database/webDb";

function resolveSelectedDate(month: number, year: number): Date {
	const today = new Date();
	const isTodayInMonth = today.getFullYear() === year && today.getMonth() === month;
	if (isTodayInMonth) return new Date(today.getFullYear(), today.getMonth(), today.getDate());
	return new Date(year, month, 1);
}

function formatSuggestionSubtitle(startDate: string, allDay: boolean): string {
	const date = new Date(startDate);
	const today = new Date();
	const isToday = date.toDateString() === today.toDateString();
	const dateLabel = isToday ? "Today" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	const timeLabel = allDay ? "All day" : date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
	return `${dateLabel} · ${timeLabel}`;
}

export default function YearOverview() {
	const router = useRouter();
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { currentDate, selectedDate, goToMonth, setCurrentDate, setSelectedDate } = useCalendarStore();
	const safeDate = currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();
	const safeSelectedDate = selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime()) ? selectedDate : null;
	const year = safeDate.getFullYear();
	const isWebClient = typeof window !== "undefined";
	const [allEvents, setAllEvents] = useState<Event[]>(() => (isWebClient ? readAllEvents() : []));

	useEffect(() => {
		if (!isWebClient) return;
		setAllEvents(readAllEvents());
		void getEventsByMonth(year, safeDate.getMonth()).then(() => setAllEvents(readAllEvents())).catch(() => setAllEvents(readAllEvents()));
	}, [year, safeDate, isWebClient]);

	const searchSuggestions: SearchSuggestion[] = useMemo(
		() =>
			allEvents.map(event => ({
				id: event.id,
				title: event.title,
				highlight: searchQuery.trim() || event.title.slice(0, 4),
				subtitle: formatSuggestionSubtitle(event.startDate, event.allDay),
				eventId: event.id,
				eventDate: event.startDate
			})),
		[allEvents, searchQuery]
	);

	const navigateToAddEvent = () => {
		router.push({
			pathname: "/add_event_page",
			params: safeSelectedDate ? { date: safeSelectedDate.toISOString() } : undefined
		});
	};

	const handleBackToHome = () => {
		if (router.canGoBack()) router.back();
		else router.push("/home");
	};

	const handleMonthSelect = (month: number, selectedYear: number) => {
		goToMonth(month, selectedYear);
		setSelectedDate(resolveSelectedDate(month, selectedYear));
		router.push("/home");
	};

	const handleYearChange = (nextYear: number) => {
		setCurrentDate(new Date(nextYear, safeDate.getMonth(), 1));
	};

	const handleSearchClose = useCallback(() => {
		setSearchVisible(false);
		setSearchQuery("");
	}, []);

	const handleSuggestionPress = useCallback(
		(suggestion: SearchSuggestion) => {
			handleSearchClose();
			if (suggestion.eventId) {
				router.push({ pathname: "/event_details", params: { id: suggestion.eventId } });
			} else if (suggestion.eventDate) {
				const date = new Date(suggestion.eventDate);
				if (!Number.isNaN(date.getTime())) {
					setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
					setSelectedDate(date);
					router.push("/home");
				}
			} else {
				router.push("/event_details");
			}
		},
		[router, setCurrentDate, setSelectedDate, handleSearchClose]
	);

	return (
		<GlassScreen edges={["top"]}>
			<MotionView enter="fade" duration={280}>
				<GlassTopBar
					onAddPress={navigateToAddEvent}
					onSearchPress={() => {
						setSearchQuery("");
						setSearchVisible(true);
					}}
					onCalendarPress={handleBackToHome}
					onSettingsPress={() => router.push("/settings")}
				/>
			</MotionView>

			<MotionView enter="fadeUp" delay={40} style={styles.content}>
				<YearView currentYear={year} selectedMonth={safeDate.getMonth()} onMonthSelect={handleMonthSelect} onYearChange={handleYearChange} />
			</MotionView>

			<SearchOverlay visible={searchVisible} query={searchQuery} onQueryChange={setSearchQuery} onClose={handleSearchClose} suggestions={searchSuggestions.length > 0 ? searchSuggestions : undefined} onSuggestionPress={handleSuggestionPress} />
		</GlassScreen>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingTop: 8
	}
});

import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { CalendarEvent } from "../components/calendar/DayCell";
import { MonthView } from "../components/calendar/MonthView";
import { AddEventCard } from "../components/events/AddEventCard";
import { EventCard } from "../components/events/EventCard";
import { SearchOverlay, type SearchSuggestion } from "../components/search/SearchOverlay";
import { GlassScreen } from "../components/ui/GlassScreen";
import { GlassTopBar } from "../components/ui/GlassTopBar";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { MotionView } from "../components/ui/MotionView";
import { getEventsByMonth, useEventsByMonth } from "../database/events";
import { useCalendarStore } from "../database/stores";
import type { Event } from "../database/types";
import { readAllEvents, readEventsForMonth } from "../database/webDb";
import { Spacing } from "../design/tokens";

function formatEventTime(startDate: string, allDay: boolean): string {
	if (allDay) return "All day";
	return new Date(startDate).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true
	});
}

function formatSuggestionSubtitle(startDate: string, allDay: boolean): string {
	const date = new Date(startDate);
	const today = new Date();
	const isToday = date.toDateString() === today.toDateString();
	const dateLabel = isToday ? "Today" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	const timeLabel = allDay
		? "All day"
		: date.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true
			});
	return `${dateLabel} · ${timeLabel}`;
}

export default function Home() {
	const router = useRouter();
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { currentDate, selectedDate, setSelectedDate, setCurrentDate } = useCalendarStore();
	const safeDate = currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();
	const year = safeDate.getFullYear();
	const month = safeDate.getMonth();
	const { data: queryEvents = [] } = useEventsByMonth(year, month);
	const isWebClient = typeof window !== "undefined";
	const [webEvents, setWebEvents] = useState<Event[]>(() => (isWebClient ? readEventsForMonth(year, month) : []));
	const [allWebEvents, setAllWebEvents] = useState<Event[]>(() => (isWebClient ? readAllEvents() : []));

	useEffect(() => {
		if (!isWebClient) return;

		async function loadWebEvents() {
			try {
				const fromDb = await getEventsByMonth(year, month);
				setWebEvents(fromDb.length > 0 ? fromDb : readEventsForMonth(year, month));
				setAllWebEvents(readAllEvents());
			} catch (error) {
				console.error("[Home] Failed to load events:", error);
				setWebEvents(readEventsForMonth(year, month));
				setAllWebEvents(readAllEvents());
			}
		}

		void loadWebEvents();
	}, [year, month, isWebClient]);

	const events = isWebClient ? webEvents : queryEvents;
	const searchEvents = isWebClient ? allWebEvents : queryEvents;
	const safeSelectedDate = selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime()) ? selectedDate : null;

	const calendarEvents: CalendarEvent[] = useMemo(
		() =>
			events.map(event => ({
				id: event.id,
				title: event.title,
				color: event.color,
				startTime: new Date(event.startDate),
				endTime: event.endDate ? new Date(event.endDate) : undefined
			})),
		[events]
	);

	const selectedDayEvents = useMemo(() => {
		if (!safeSelectedDate) return [];
		return events.filter(event => {
			const eventDate = new Date(event.startDate);
			return !Number.isNaN(eventDate.getTime()) && eventDate.toDateString() === safeSelectedDate.toDateString();
		});
	}, [events, safeSelectedDate]);

	const searchSuggestions: SearchSuggestion[] = useMemo(
		() =>
			searchEvents.map(event => ({
				id: event.id,
				title: event.title,
				highlight: searchQuery.trim() || event.title.slice(0, 4),
				subtitle: formatSuggestionSubtitle(event.startDate, event.allDay),
				eventId: event.id,
				eventDate: event.startDate
			})),
		[searchEvents, searchQuery]
	);

	const eventListKey = safeSelectedDate?.toISOString() ?? "none";

	const navigateToAddEvent = useCallback(() => {
		router.push({
			pathname: "/add_event_page",
			params: safeSelectedDate ? { date: safeSelectedDate.toISOString() } : undefined
		});
	}, [router, safeSelectedDate]);

	const handleSearchOpen = useCallback(() => {
		setSearchQuery("");
		setSearchVisible(true);
	}, []);

	const handleSearchClose = useCallback(() => {
		setSearchVisible(false);
		setSearchQuery("");
	}, []);

	const handleSuggestionPress = useCallback(
		(suggestion: SearchSuggestion) => {
			handleSearchClose();
			if (suggestion.eventId) {
				router.push({
					pathname: "/event_details",
					params: { id: suggestion.eventId }
				});
			} else if (suggestion.eventDate) {
				const date = new Date(suggestion.eventDate);
				if (!Number.isNaN(date.getTime())) {
					setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
					setSelectedDate(date);
				}
			} else {
				router.push("/event_details");
			}
		},
		[router, setCurrentDate, setSelectedDate, handleSearchClose]
	);

	return (
		<GlassScreen>
			<MotionView enter="fade" duration={280}>
				<GlassTopBar onAddPress={navigateToAddEvent} onSearchPress={handleSearchOpen} onCalendarPress={() => router.push("/year_overview")} onSettingsPress={() => router.push("/settings")} />
			</MotionView>

			<MotionView enter="fadeUp" delay={40} style={styles.calendarSection}>
				<LiquidGlassCard size="medium" style={styles.calendarCard} noPadding>
					<MonthView currentDate={safeDate} selectedDate={safeSelectedDate ?? undefined} events={calendarEvents} onDateSelect={setSelectedDate} onMonthChange={setCurrentDate} onMonthTitlePress={() => router.push("/year_overview")} variant="dark" />
				</LiquidGlassCard>
			</MotionView>

			<ScrollView style={styles.eventsScroll} contentContainerStyle={styles.eventsContent} showsVerticalScrollIndicator={false}>
				{selectedDayEvents.map((event, index) => (
					<EventCard
						key={`${eventListKey}-${event.id}`}
						animationKey={`${eventListKey}-${event.id}`}
						index={index}
						title={event.title}
						subtitle={event.location ?? event.description ?? "Online event"}
						time={formatEventTime(event.startDate, event.allDay)}
						onPress={() => {
							router.push({
								pathname: "/event_details",
								params: { id: event.id }
							});
						}}
					/>
				))}

				<AddEventCard onPress={navigateToAddEvent} />
			</ScrollView>

			<SearchOverlay visible={searchVisible} query={searchQuery} onQueryChange={setSearchQuery} onClose={handleSearchClose} suggestions={searchSuggestions.length > 0 ? searchSuggestions : undefined} onSuggestionPress={handleSuggestionPress} />
		</GlassScreen>
	);
}

const styles = StyleSheet.create({
	calendarSection: {
		paddingHorizontal: Spacing.screen,
		paddingTop: 8,
		paddingBottom: 4
	},
	calendarCard: {
		width: "100%",
		overflow: "hidden"
	},
	eventsScroll: {
		flex: 1,
		marginTop: 16
	},
	eventsContent: {
		paddingHorizontal: Spacing.screen,
		paddingTop: 4,
		paddingBottom: 32,
		gap: 12
	}
});

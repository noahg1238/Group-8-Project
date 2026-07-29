import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { addMonths, getMonthGrid, isValidYear } from "../../design/calendar";
import { Colors, Typography } from "../../design/tokens";
import { IconButton } from "../ui/IconButton";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { MotionView } from "../ui/MotionView";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export interface MiniMonthCalendarProps {
	date: Date;
	selectedDate?: Date;
	onDateSelect?: (date: Date) => void;
}

function AnimatedDayCell({ day, isSelected, isWeekend, onPress, disabled }: { day: { date: Date; dayOfMonth: number; isCurrentMonth: boolean }; isSelected: boolean; isWeekend: boolean; onPress: () => void; disabled: boolean }) {
	const selection = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
	const textScale = useRef(new Animated.Value(isSelected ? 1.06 : 1)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.spring(selection, { toValue: isSelected ? 1 : 0, friction: 6, tension: 180, useNativeDriver: true }),
			Animated.spring(textScale, { toValue: isSelected ? 1.06 : 1, friction: 6, tension: 180, useNativeDriver: true })
		]).start();
	}, [isSelected, selection, textScale]);

	const selectedStyle = {
		opacity: selection,
		transform: [{ scale: selection.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }]
	};

	return (
		<Pressable style={styles.dayCell} onPress={onPress} disabled={disabled}>
			<Animated.View style={[styles.dayInner, styles.daySelected, selectedStyle]} />
			<Animated.Text style={[styles.dayText, !day.isCurrentMonth && styles.dayMuted, isWeekend && day.isCurrentMonth && styles.dayWeekend, isSelected && styles.dayTextSelected, { transform: [{ scale: textScale }] }]}>{day.dayOfMonth}</Animated.Text>
		</Pressable>
	);
}

export function MiniMonthCalendar({ date, selectedDate, onDateSelect }: MiniMonthCalendarProps) {
	const [visibleMonth, setVisibleMonth] = useState(() => new Date(date.getFullYear(), date.getMonth(), 1));

	useEffect(() => {
		setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
	}, [date]);

	const grid = useMemo(() => getMonthGrid(visibleMonth.getFullYear(), visibleMonth.getMonth()), [visibleMonth]);
	const monthLabel = `${visibleMonth.toLocaleString("en-US", { month: "long" })} | ${visibleMonth.getFullYear()}`;

	const goPrevious = useCallback(() => {
		const prev = addMonths(visibleMonth, -1);
		if (isValidYear(prev.getFullYear())) setVisibleMonth(prev);
	}, [visibleMonth]);

	const goNext = useCallback(() => {
		const next = addMonths(visibleMonth, 1);
		if (isValidYear(next.getFullYear())) setVisibleMonth(next);
	}, [visibleMonth]);

	const activeDate = selectedDate ?? date;

	return (
		<MotionView enter="fadeUp" duration={220}>
			<LiquidGlassCard size="medium">
				<View style={styles.header}>
					<IconButton name="chevron-left" family="feather" size={18} color={Colors.text.accent} onPress={goPrevious} style={styles.navButton} />
					<Text style={styles.monthTitle}>{monthLabel}</Text>
					<IconButton name="chevron-right" family="feather" size={18} color={Colors.text.accent} onPress={goNext} style={styles.navButton} />
				</View>

				<View style={styles.weekdayRow}>
					{WEEKDAY_LABELS.map(label => (
						<Text key={label} style={styles.weekday}>
							{label}
						</Text>
					))}
				</View>

				<View style={styles.grid}>
					{grid.map((week, weekIndex) => (
						<View key={weekIndex} style={styles.weekRow}>
							{week.map(day => {
								const isSelected = activeDate.toDateString() === day.date.toDateString();
								const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
								return <AnimatedDayCell key={day.date.toISOString()} day={day} isSelected={isSelected} isWeekend={isWeekend} onPress={() => onDateSelect?.(day.date)} disabled={!onDateSelect} />;
							})}
						</View>
					))}
				</View>
			</LiquidGlassCard>
		</MotionView>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
		paddingHorizontal: 4,
		width: "100%",
		height: 36
	},
	navButton: {
		width: 36,
		height: 36
	},
	monthTitle: {
		fontSize: 24,
		color: Colors.text.accent,
		fontWeight: Typography.fontWeight.regular
	},
	weekdayRow: {
		flexDirection: "row",
		width: "100%",
		marginBottom: 4,
		paddingTop: 4
	},
	weekday: {
		flex: 1,
		flexBasis: 0,
		textAlign: "center",
		fontSize: 12,
		color: Colors.text.tertiary,
		lineHeight: 20
	},
	grid: {
		width: "100%",
		gap: 1
	},
	weekRow: {
		flexDirection: "row",
		width: "100%"
	},
	dayCell: {
		flex: 1,
		flexBasis: 0,
		aspectRatio: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 1,
		minWidth: 0
	},
	dayInner: {
		...StyleSheet.absoluteFillObject,
		margin: 4,
		borderRadius: 10
	},
	daySelected: {
		backgroundColor: Colors.text.accent
	},
	dayText: {
		fontSize: 14,
		color: Colors.text.primary,
		zIndex: 1
	},
	dayMuted: {
		color: Colors.text.disabled
	},
	dayWeekend: {
		color: Colors.error
	},
	dayTextSelected: {
		color: Colors.text.primary,
		fontWeight: Typography.fontWeight.semibold
	}
});

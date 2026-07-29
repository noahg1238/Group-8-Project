// Year overview — 3×4 mini month grid
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import { getYearMonths, isValidYear } from "../../design/calendar";
import { BorderRadius, Colors, Spacing } from "../../design/tokens";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { GlassDepthLayer } from "../ui/GlassDepthLayer";
import { IconButton } from "../ui/IconButton";
import { MotionView, PrototypeMotion, staggerMs } from "../ui/MotionView";
import { MonthCell } from "./MonthCell";

const ADJACENT_YEAR_COLOR = "#8C9EB8";
const YEAR_GRID_GAP = 4;
const YEAR_ROW_GAP = 33;
const YEAR_STAGGER_MS = 28;

export interface YearViewProps {
	currentYear: number;
	selectedMonth?: number;
	onMonthSelect?: (month: number, year: number) => void;
	onYearChange?: (year: number) => void;
}

const YearViewBase: React.FC<YearViewProps> = ({ currentYear, onMonthSelect, onYearChange }) => {
	const [year, setYear] = useState(currentYear);
	const [slideDirection, setSlideDirection] = useState<"prev" | "next">("next");
	const today = new Date();
	const actualCurrentYear = today.getFullYear();
	const yearPulse = useRef(new Animated.Value(1)).current;
	const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

	useEffect(() => {
		setYear(currentYear);
	}, [currentYear]);

	useEffect(() => {
		pulseLoop.current?.stop();
		if (year === actualCurrentYear) {
			pulseLoop.current = Animated.loop(
				Animated.sequence([
					Animated.timing(yearPulse, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
					Animated.timing(yearPulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
				])
			);
			pulseLoop.current.start();
		} else {
			Animated.timing(yearPulse, { toValue: 1, duration: 150, useNativeDriver: true }).start();
		}
		return () => pulseLoop.current?.stop();
	}, [year, actualCurrentYear, yearPulse]);

	const months = getYearMonths(isValidYear(year) ? year : new Date().getFullYear());

	const navigateToYear = useCallback(
		(nextYear: number) => {
			if (!isValidYear(nextYear) || nextYear === year) return;
			setSlideDirection(nextYear > year ? "next" : "prev");
			setYear(nextYear);
			onYearChange?.(nextYear);
		},
		[year, onYearChange]
	);

	const handleMonthSelect = useCallback(
		(month: number, monthYear: number) => {
			onMonthSelect?.(month, monthYear);
		},
		[onMonthSelect]
	);

	const canNavigatePrevious = isValidYear(year - 1);
	const canNavigateNext = isValidYear(year + 1);
	const fromX = slideDirection === "next" ? PrototypeMotion.slideDistance : -PrototypeMotion.slideDistance;

	return (
		<View style={styles.container}>
			<View style={styles.yearNav}>
				<AnimatedPressable onPress={() => canNavigatePrevious && navigateToYear(year - 1)} disabled={!canNavigatePrevious} pressScale={0.94} haptic="selection">
					<Text style={[styles.adjacentYear, !canNavigatePrevious && styles.disabled]}>{year - 1}</Text>
				</AnimatedPressable>

				<IconButton name="chevron-left" family="feather" size={16} color={ADJACENT_YEAR_COLOR} onPress={() => navigateToYear(year - 1)} disabled={!canNavigatePrevious} style={styles.chevronButton} />

				<Animated.Text style={[styles.currentYear, { transform: [{ scale: yearPulse }] }]}>{year}</Animated.Text>

				<IconButton name="chevron-right" family="feather" size={16} color={ADJACENT_YEAR_COLOR} onPress={() => navigateToYear(year + 1)} disabled={!canNavigateNext} style={styles.chevronButton} />

				<AnimatedPressable onPress={() => canNavigateNext && navigateToYear(year + 1)} disabled={!canNavigateNext} pressScale={0.94} haptic="selection">
					<Text style={[styles.adjacentYear, !canNavigateNext && styles.disabled]}>{year + 1}</Text>
				</AnimatedPressable>
			</View>

			<GlassDepthLayer borderRadius={BorderRadius.glass} shimmer style={styles.glassContainer} contentStyle={styles.glassContent}>
				<MotionView key={year} enter="slide" fromX={fromX} duration={PrototypeMotion.smartAnimateMs} style={styles.gridWrapper}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
						{[months.slice(0, 3), months.slice(3, 6), months.slice(6, 9), months.slice(9, 12)].map((row, rowIndex) => (
							<View key={rowIndex} style={styles.monthRow}>
								{row.map((monthData, colIndex) => {
									const isCurrentMonth = year === today.getFullYear() && monthData.month === today.getMonth();
									const animationIndex = rowIndex * 3 + colIndex;
									return (
										<MotionView key={`${year}-${monthData.month}`} enter="fadeUp" delay={staggerMs(animationIndex, YEAR_STAGGER_MS)} fromY={10} style={styles.monthCellWrapper}>
											<MonthCell monthData={monthData} isCurrentMonth={isCurrentMonth} onPress={handleMonthSelect} />
										</MotionView>
									);
								})}
							</View>
						))}
					</ScrollView>
				</MotionView>
			</GlassDepthLayer>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: Spacing.screen
	},
	yearNav: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: YEAR_GRID_GAP,
		height: 36,
		marginBottom: 12,
		alignSelf: "center",
		maxWidth: 300,
		width: "100%"
	},
	adjacentYear: {
		fontSize: 14,
		fontWeight: "500",
		color: ADJACENT_YEAR_COLOR,
		opacity: 0.85,
		minWidth: 40,
		textAlign: "center"
	},
	currentYear: {
		fontSize: 22,
		fontWeight: "600",
		color: Colors.accent.blue,
		minWidth: 56,
		textAlign: "center"
	},
	disabled: {
		opacity: 0.3
	},
	chevronButton: {
		width: 28,
		height: 28
	},
	glassContainer: {
		flex: 1,
		marginBottom: Spacing.base
	},
	glassContent: {
		flex: 1,
		padding: 6
	},
	gridWrapper: {
		flex: 1
	},
	scrollView: {
		flex: 1
	},
	scrollContent: {
		paddingBottom: Spacing.lg,
		gap: YEAR_ROW_GAP
	},
	monthRow: {
		flexDirection: "row",
		gap: YEAR_GRID_GAP
	},
	monthCellWrapper: {
		flex: 1
	}
});

export const YearView = memo(YearViewBase);

// Mini month cell for year overview grid
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getMiniCalendarCellCount, MonthData } from "../../design/calendar";
import { Colors } from "../../design/tokens";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { MotionView } from "../ui/MotionView";

export interface MonthCellProps {
	monthData: MonthData;
	isCurrentMonth?: boolean;
	onPress?: (month: number, year: number) => void;
}

const MINI_DAY_SIZE = 16;
const MINI_ROW_HEIGHT = 16;

const MonthCellBase: React.FC<MonthCellProps> = ({ monthData, isCurrentMonth = false, onPress }) => {
	const { month, year, name, daysInMonth, firstDayOfMonth } = monthData;
	const today = new Date();
	const isTodayInMonth = today.getFullYear() === year && today.getMonth() === month;

	const renderMiniDays = () => {
		const totalCells = getMiniCalendarCellCount(firstDayOfMonth, daysInMonth);
		const cells: React.JSX.Element[] = [];

		for (let i = 0; i < totalCells; i += 1) {
			const dayNumber = i - firstDayOfMonth + 1;
			const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth;
			const isToday = isTodayInMonth && isValidDay && dayNumber === today.getDate();

			cells.push(
				<View key={i} style={styles.dayCell}>
					{isValidDay ? (
						isToday ? (
							<MotionView enter="scale" duration={220} fromScale={0.6} style={styles.todayInner}>
								<Text style={[styles.dayText, styles.todayText]}>{dayNumber}</Text>
							</MotionView>
						) : (
							<View style={styles.dayInner}>
								<Text style={styles.dayText}>{dayNumber}</Text>
							</View>
						)
					) : null}
				</View>
			);
		}

		return cells;
	};

	return (
		<AnimatedPressable style={styles.container} onPress={() => onPress?.(month, year)} disabled={!onPress} pressScale={0.96} haptic="selection">
			<View style={styles.monthLabelRow}>
				{isCurrentMonth ? (
					<MotionView enter="fade" duration={250} style={styles.currentMonthPill}>
						<Text style={styles.currentMonthText} numberOfLines={1}>
							{name}
						</Text>
					</MotionView>
				) : (
					<Text style={styles.monthName} numberOfLines={1}>
						{name}
					</Text>
				)}
			</View>

			<View style={styles.miniGrid}>{renderMiniDays()}</View>
		</AnimatedPressable>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.screen,
		borderRadius: 8,
		paddingHorizontal: 6,
		paddingTop: 2,
		paddingBottom: 4,
		minHeight: 135,
		maxHeight: 135,
		overflow: "hidden"
	},
	monthLabelRow: {
		alignItems: "center",
		justifyContent: "center",
		minHeight: 31,
		marginBottom: 4
	},
	monthName: {
		fontSize: 14,
		fontWeight: "400",
		color: "#FFFFFF",
		textAlign: "center"
	},
	currentMonthPill: {
		backgroundColor: Colors.accent.blue,
		borderRadius: 6,
		minHeight: 27,
		paddingHorizontal: 10,
		paddingVertical: 4,
		alignItems: "center",
		justifyContent: "center",
		maxWidth: "100%"
	},
	currentMonthText: {
		fontSize: 14,
		fontWeight: "400",
		color: "#FFFFFF",
		textAlign: "center"
	},
	miniGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		width: "100%"
	},
	dayCell: {
		width: `${100 / 7}%`,
		height: MINI_ROW_HEIGHT,
		alignItems: "center",
		justifyContent: "center"
	},
	dayInner: {
		width: MINI_DAY_SIZE,
		height: 14,
		alignItems: "center",
		justifyContent: "center"
	},
	todayInner: {
		width: MINI_DAY_SIZE,
		height: 14,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.accent.blue,
		borderRadius: 10
	},
	dayText: {
		fontSize: 11,
		fontWeight: "400",
		color: "#FFFFFF",
		lineHeight: 14,
		textAlign: "center",
		includeFontPadding: false,
		fontVariant: ["tabular-nums"],
		width: MINI_DAY_SIZE
	},
	todayText: {
		fontWeight: "500"
	}
});

export const MonthCell = memo(MonthCellBase);

// Dark glass month grid — Su–Sa headers, pipe-separated title
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import {
  addMonths,
  CalendarDay,
  getMonthGrid,
  isValidYear,
  MONTH_NAMES,
} from "../../design/calendar";
import { Colors } from "../../design/tokens";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { Icon } from "../ui/Icon";
import { MotionView, PrototypeMotion } from "../ui/MotionView";
import { CalendarEvent, DayCell } from "./DayCell";

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_TITLE_BLUE = Colors.accent.blue;

export interface MonthViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  onMonthTitlePress?: () => void;
  onTodayPress?: () => void;
  selectedDate?: Date;
  showHeader?: boolean;
  showWeekNumbers?: boolean;
  enableSwipe?: boolean;
  firstDayOfWeek?: 0 | 1;
  variant?: "light" | "dark";
}

function formatMonthTitle(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} | ${date.getFullYear()}`;
}

function MonthNavButton({
  direction,
  onPress,
  disabled,
  isDark,
}: {
  direction: "prev" | "next";
  onPress: () => void;
  disabled: boolean;
  isDark: boolean;
}) {
  const nudge = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    if (disabled) return;
    Animated.sequence([
      Animated.spring(nudge, {
        toValue: direction === "prev" ? -4 : 4,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.spring(nudge, {
        toValue: 0,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  }, [direction, disabled, nudge, onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.navButton, disabled && styles.navButtonDisabled]}
      haptic="light"
      accessibilityLabel={
        direction === "prev" ? "Previous month" : "Next month"
      }
    >
      <Animated.View style={{ transform: [{ translateX: nudge }] }}>
        <Icon
          name={direction === "prev" ? "chevron-left" : "chevron-right"}
          family="feather"
          size={20}
          color={isDark ? "#FFFFFF" : "#007AFF"}
        />
      </Animated.View>
    </AnimatedPressable>
  );
}

const MonthViewBase: React.FC<MonthViewProps> = ({
  currentDate,
  events = [],
  onDateSelect,
  onMonthChange,
  onMonthTitlePress,
  selectedDate,
  showHeader = true,
  showWeekNumbers = false,
  variant = "dark",
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(currentDate);
  const [slideDirection, setSlideDirection] = useState<"prev" | "next">("next");

  useEffect(() => {
    setCurrentMonth(currentDate);
  }, [currentDate]);

  const grid = getMonthGrid(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  );
  const gridKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] =>
      events.filter((event) => {
        if (!event.startTime) return false;
        return event.startTime.toDateString() === date.toDateString();
      }),
    [events],
  );

  const navigatePrevious = useCallback(() => {
    const prevMonth = addMonths(currentMonth, -1);
    if (!isValidYear(prevMonth.getFullYear())) return;
    setSlideDirection("prev");
    setCurrentMonth(prevMonth);
    onMonthChange?.(prevMonth);
  }, [currentMonth, onMonthChange]);

  const navigateNext = useCallback(() => {
    const nextMonth = addMonths(currentMonth, 1);
    if (!isValidYear(nextMonth.getFullYear())) return;
    setSlideDirection("next");
    setCurrentMonth(nextMonth);
    onMonthChange?.(nextMonth);
  }, [currentMonth, onMonthChange]);

  const canNavigatePrevious = isValidYear(
    addMonths(currentMonth, -1).getFullYear(),
  );
  const canNavigateNext = isValidYear(addMonths(currentMonth, 1).getFullYear());
  const isDark = variant === "dark";

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {showHeader ? (
        <View style={styles.header}>
          <MonthNavButton
            direction="prev"
            onPress={navigatePrevious}
            disabled={!canNavigatePrevious}
            isDark={isDark}
          />
          <AnimatedPressable
            onPress={onMonthTitlePress}
            disabled={!onMonthTitlePress}
            style={styles.titlePressable}
            haptic="selection"
            accessibilityRole="button"
            accessibilityLabel={`${formatMonthTitle(currentMonth)}, open year overview`}
          >
            <Text
              style={[styles.monthYearText, isDark && styles.monthYearTextDark]}
            >
              {formatMonthTitle(currentMonth)}
            </Text>
          </AnimatedPressable>
          <MonthNavButton
            direction="next"
            onPress={navigateNext}
            disabled={!canNavigateNext}
            isDark={isDark}
          />
        </View>
      ) : null}

      <View style={styles.weekdayHeader}>
        {WEEKDAY_NAMES.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[styles.weekdayText, isDark && styles.weekdayTextDark]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <MotionView
        key={gridKey}
        enter="slide"
        fromX={
          slideDirection === "next"
            ? PrototypeMotion.slideDistance
            : -PrototypeMotion.slideDistance
        }
        duration={PrototypeMotion.smartAnimateMs}
        style={styles.gridContainer}
      >
        <View style={styles.calendarGrid}>
          {grid.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {showWeekNumbers && (
                <View style={styles.weekNumberCell}>
                  <Text
                    style={[
                      styles.weekNumberText,
                      isDark && styles.weekNumberTextDark,
                    ]}
                  >
                    {Math.ceil(week[0].dayOfMonth / 7)}
                  </Text>
                </View>
              )}
              {week.map((day: CalendarDay, dayIndex: number) => (
                <DayCell
                  key={`${gridKey}-${weekIndex}-${dayIndex}`}
                  day={day}
                  events={getEventsForDate(day.date)}
                  isSelected={
                    selectedDate
                      ? selectedDate.toDateString() === day.date.toDateString()
                      : false
                  }
                  onPress={onDateSelect}
                  showEvents
                  maxEventUnderlines={1}
                  variant={variant}
                />
              ))}
            </View>
          ))}
        </View>
      </MotionView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "stretch",
    overflow: "visible",
  },
  containerDark: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 36,
    marginBottom: 4,
  },
  titlePressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
  },
  monthYearTextDark: {
    fontSize: 24,
    fontWeight: "400",
    color: MONTH_TITLE_BLUE,
  },
  weekdayHeader: {
    flexDirection: "row",
    width: "100%",
    gap: 1,
    paddingTop: 8,
    paddingBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  weekdayText: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    textAlign: "center",
  },
  weekdayTextDark: {
    fontWeight: "400",
    color: "#757575",
    textTransform: "none",
  },
  gridContainer: {
    width: "100%",
    paddingBottom: 16,
  },
  calendarGrid: {
    width: "100%",
    gap: 1,
  },
  weekRow: {
    flexDirection: "row",
    width: "100%",
    gap: 1,
    height: 41,
  },
  weekNumberCell: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 8,
  },
  weekNumberText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#C7C7CC",
  },
  weekNumberTextDark: {
    color: "#757575",
  },
});

export const MonthView = memo(MonthViewBase);

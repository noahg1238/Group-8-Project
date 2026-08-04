// Dark glass month grid cell with event underline indicators
import React, { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { CalendarDay } from "../../design/calendar";
import { staggerDelay } from "../../design/motion";
import { Colors } from "../../design/tokens";
import { AnimatedCalendarPressable } from "../ui/AnimatedCalendarPressable";

export interface CalendarEvent {
  id: string;
  title: string;
  color: string;
  startTime?: Date;
  endTime?: Date;
}

export interface DayCellProps {
  day: CalendarDay;
  events?: CalendarEvent[];
  isSelected?: boolean;
  onPress?: (date: Date) => void;
  onLongPress?: (date: Date) => void;
  showEvents?: boolean;
  maxEventUnderlines?: number;
  variant?: "light" | "dark";
}

const SELECTED_BLUE = Colors.accent.blue;
const WEEKEND_TEXT = "#C77B8A";
const MUTED_TEXT = "#757575";
const DEFAULT_TEXT = "#FFFFFF";
const CELL_SIZE = 40;
const SELECTED_RADIUS = 10;

function EventUnderline({ color, index }: { color: string; index: number }) {
  const scaleX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleX, {
      toValue: 1,
      friction: 6,
      tension: 140,
      delay: staggerDelay(index, 40),
      useNativeDriver: true,
    }).start();
  }, [color, index, scaleX]);

  return (
    <Animated.View
      style={[
        styles.eventUnderline,
        { backgroundColor: color, transform: [{ scaleX }] },
      ]}
    />
  );
}

const DayCellBase: React.FC<DayCellProps> = ({
  day,
  events = [],
  isSelected = false,
  onPress,
  onLongPress,
  showEvents = true,
  maxEventUnderlines = 1,
  variant = "dark",
}) => {
  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
  const eventColors = events
    .map((event) => event.color)
    .filter(Boolean)
    .slice(0, maxEventUnderlines);

  const selection = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(selection, {
      toValue: isSelected ? 1 : 0,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [isSelected, selection]);

  const dateTextColor = (() => {
    if (isSelected) return "#FFFFFF";
    if (!day.isCurrentMonth) return MUTED_TEXT;
    if (isWeekend) return WEEKEND_TEXT;
    return DEFAULT_TEXT;
  })();

  return (
    <AnimatedCalendarPressable
      style={[styles.container, variant === "light" && styles.containerLight]}
      onPress={() => onPress?.(day.date)}
      onLongPress={() => onLongPress?.(day.date)}
      disabled={!onPress}
      haptic="selection"
      pressScale={0.94}
      accessibilityRole="button"
      accessibilityLabel={`${day.dayOfMonth}`}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.dateWrap}>
        <Animated.View
          style={[
            styles.selectedSquare,
            { opacity: selection, transform: [{ scale: selection }] },
          ]}
          pointerEvents="none"
        />
        <Text
          style={[
            styles.dateText,
            { color: dateTextColor },
            isSelected && styles.selectedText,
            !day.isCurrentMonth && !isSelected && styles.otherMonthText,
          ]}
        >
          {day.dayOfMonth}
        </Text>
      </View>

      {showEvents && eventColors.length > 0 && (
        <View style={styles.underlinesContainer}>
          {eventColors.map((color, index) => (
            <EventUnderline
              key={`${day.date.toISOString()}-${index}`}
              color={color}
              index={index}
            />
          ))}
        </View>
      )}
    </AnimatedCalendarPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 0,
    height: 41,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 3,
  },
  containerLight: {
    height: 44,
  },
  dateWrap: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  selectedSquare: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SELECTED_BLUE,
    borderRadius: SELECTED_RADIUS,
  },
  dateText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "400",
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  otherMonthText: {
    opacity: 0.55,
  },
  underlinesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    marginTop: -8,
    minHeight: 2,
    width: "100%",
  },
  eventUnderline: {
    width: 24,
    height: 2,
    borderRadius: 1,
  },
});

export const DayCell = memo(DayCellBase);

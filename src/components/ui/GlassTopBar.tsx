import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors, GlassControl, Spacing } from "../../design/tokens";
import { AnimatedPressable } from "./AnimatedPressable";
import { Icon } from "./Icon";
import { LiquidGlassCard } from "./LiquidGlassCard";

export interface GlassTopBarProps {
  onAddPress?: () => void;
  onSearchPress?: () => void;
  onCalendarPress?: () => void;
  onSettingsPress?: () => void;
}

const ADD_ICON_SIZE = 24;

const ACTION_HITS = {
  search: 35,
  calendar: 35,
  settings: 35,
} as const;

export function GlassTopBar({
  onAddPress,
  onSearchPress,
  onCalendarPress,
  onSettingsPress,
}: GlassTopBarProps) {
  return (
    <View style={styles.container}>
      <AnimatedPressable
        onPress={onAddPress}
        style={styles.controlHit}
        haptic="light"
        accessibilityLabel="Add event"
        accessibilityRole="button"
      >
        <LiquidGlassCard
          size="small"
          tint="toolbar"
          style={styles.glassControl}
        >
          <View style={styles.addGlassInner}>
            <Icon
              name="plus"
              family="feather"
              size={ADD_ICON_SIZE}
              color={Colors.text.primary}
            />
          </View>
        </LiquidGlassCard>
      </AnimatedPressable>

      <LiquidGlassCard size="small" tint="toolbar" style={styles.actionsGlass}>
        <View style={styles.actionsRow}>
          <AnimatedPressable
            onPress={onSearchPress}
            style={[
              styles.actionHit,
              { width: ACTION_HITS.search, height: ACTION_HITS.search },
            ]}
            haptic="light"
            accessibilityLabel="Search"
            accessibilityRole="button"
          >
            <Icon
              name="search"
              family="feather"
              size={22}
              color={Colors.text.primary}
            />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={onCalendarPress}
            style={[
              styles.actionHit,
              {
                width: ACTION_HITS.calendar,
                height: ACTION_HITS.calendar,
              },
            ]}
            haptic="light"
            accessibilityLabel="Year overview"
            accessibilityRole="button"
          >
            <Icon
              name="calendar"
              family="feather"
              size={22}
              color={Colors.text.primary}
            />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={onSettingsPress}
            style={[
              styles.actionHit,
              { width: ACTION_HITS.settings, height: ACTION_HITS.settings },
            ]}
            haptic="light"
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Icon
              name="settings"
              family="feather"
              size={22}
              color={Colors.text.primary}
            />
          </AnimatedPressable>
        </View>
      </LiquidGlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.topBar,
    paddingTop: 4,
    paddingBottom: 8,
  },
  glassControl: {
    width: GlassControl.size,
    height: GlassControl.size,
  },
  addGlassInner: {
    width: GlassControl.size,
    height: GlassControl.size,
    alignItems: "center",
    justifyContent: "center",
  },
  controlHit: {
    borderRadius: GlassControl.size / 2,
  },
  actionsGlass: {
    height: GlassControl.size,
    paddingHorizontal: GlassControl.pillPaddingH,
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  actionHit: {
    alignItems: "center",
    justifyContent: "center",
  },
});

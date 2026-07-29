import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors, GlassControl, Spacing } from "../../design/tokens";
import { AnimatedPressable } from "./AnimatedPressable";
import { usePushBack } from "./GlassScreen";
import { Icon } from "./Icon";
import { LiquidGlassCard } from "./LiquidGlassCard";

export interface EventDetailsTopBarProps {
	onBackPress?: () => void;
	onSearchPress?: () => void;
	onCalendarPress?: () => void;
	onSettingsPress?: () => void;
}

export function EventDetailsTopBar({ onBackPress, onSearchPress, onCalendarPress, onSettingsPress }: EventDetailsTopBarProps) {
	const router = useRouter();
	const pushBack = usePushBack(onBackPress ?? (() => router.back()));

	return (
		<View style={styles.container}>
			<AnimatedPressable onPress={pushBack ?? (() => router.back())} style={styles.backButton} haptic="light" accessibilityRole="button" accessibilityLabel="Go back">
				<LiquidGlassCard size="small" tint="toolbar" style={styles.backGlass}>
					<View style={styles.backGlassInner}>
						<Icon name="chevron-left" family="feather" size={22} color={Colors.text.primary} />
					</View>
				</LiquidGlassCard>
			</AnimatedPressable>

			<LiquidGlassCard size="small" tint="toolbar" style={styles.actionsGlass}>
				<View style={styles.actionsRow}>
					<AnimatedPressable onPress={onSearchPress} style={styles.actionButton} haptic="light" accessibilityRole="button" accessibilityLabel="Search">
						<Icon name="search" family="feather" size={22} color={Colors.text.primary} />
					</AnimatedPressable>
					<AnimatedPressable onPress={onCalendarPress ?? (() => router.push("/year_overview"))} style={styles.actionButton} haptic="light" accessibilityRole="button" accessibilityLabel="Year overview">
						<Icon name="calendar" family="feather" size={22} color={Colors.text.primary} />
					</AnimatedPressable>
					<AnimatedPressable onPress={onSettingsPress ?? (() => router.push("/settings"))} style={styles.actionButton} haptic="light" accessibilityRole="button" accessibilityLabel="Settings">
						<Icon name="settings" family="feather" size={22} color={Colors.text.primary} />
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
		paddingBottom: 8
	},
	backGlass: {
		width: GlassControl.size,
		height: GlassControl.size
	},
	backGlassInner: {
		width: GlassControl.size,
		height: GlassControl.size,
		alignItems: "center",
		justifyContent: "center"
	},
	backButton: {
		borderRadius: GlassControl.size / 2
	},
	actionsGlass: {
		height: GlassControl.size,
		paddingHorizontal: GlassControl.pillPaddingH,
		justifyContent: "center"
	},
	actionsRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: GlassControl.iconGap
	},
	actionButton: {
		width: 29,
		height: 29,
		alignItems: "center",
		justifyContent: "center"
	}
});

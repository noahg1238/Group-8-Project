import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Shadows } from "../../design/tokens";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { Icon } from "../ui/Icon";
import { MotionView, staggerMs } from "../ui/MotionView";

export interface EventCardProps {
	title: string;
	subtitle?: string;
	time: string;
	onPress?: () => void;
	index?: number;
	animationKey?: string;
}

export function EventCard({ title, subtitle, time, onPress, index = 0, animationKey }: EventCardProps) {
	return (
		<MotionView key={animationKey} enter="fadeUp" delay={staggerMs(index, 40)} style={styles.wrap}>
			<AnimatedPressable onPress={onPress} style={styles.container} haptic="light" accessibilityRole="button" accessibilityLabel={`${title} ${subtitle ?? ""} ${time}`}>
				<View style={styles.content}>
					<Text style={styles.title} numberOfLines={1}>
						{title}
					</Text>
					<View style={styles.metaRow}>
						{subtitle ? (
							<Text style={styles.subtitle} numberOfLines={1}>
								{subtitle}
							</Text>
						) : null}
						<Text style={styles.time}>{time}</Text>
					</View>
				</View>
				<View style={styles.iconCircle}>
					<Icon name="chevron-right" family="feather" size={18} color="#FFFFFF" />
				</View>
			</AnimatedPressable>
		</MotionView>
	);
}

const styles = StyleSheet.create({
	wrap: {
		width: "100%",
		alignSelf: "stretch"
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "stretch",
		width: "100%",
		backgroundColor: Colors.event.background,
		borderWidth: 1,
		borderColor: Colors.event.border,
		borderRadius: 22,
		minHeight: 82,
		paddingHorizontal: 22,
		paddingVertical: 14,
		...Shadows.event
	},
	content: {
		flex: 1,
		paddingRight: 12,
		justifyContent: "center",
		gap: 6
	},
	title: {
		fontSize: 17,
		fontWeight: "600",
		color: Colors.event.title,
		lineHeight: 22
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8
	},
	subtitle: {
		flex: 1,
		fontSize: 13,
		color: Colors.event.subtitle
	},
	time: {
		fontSize: 13,
		color: Colors.event.subtitle,
		flexShrink: 0
	},
	iconCircle: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.surface.elevated
	}
});

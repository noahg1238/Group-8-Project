import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors, Shadows } from "../../design/tokens";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { Icon } from "../ui/Icon";
import { MotionView } from "../ui/MotionView";

export interface AddEventCardProps {
	onPress: () => void;
}

export function AddEventCard({ onPress }: AddEventCardProps) {
	const pulse = useRef(new Animated.Value(0.45)).current;

	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: false }),
				Animated.timing(pulse, { toValue: 0.45, duration: 1100, useNativeDriver: false })
			])
		);
		loop.start();
		return () => loop.stop();
	}, [pulse]);

	const borderColor = pulse.interpolate({
		inputRange: [0.45, 1],
		outputRange: ["rgba(255,255,255,0.18)", "rgba(107,219,173,0.55)"]
	});

	return (
		<MotionView enter="fadeUp" delay={80} style={styles.wrap}>
			<AnimatedPressable onPress={onPress} style={styles.container} haptic="light" accessibilityRole="button" accessibilityLabel="Add event">
				<Animated.View style={[styles.pulseBorder, { borderColor }]} pointerEvents="none" />
				<Text style={styles.label}>Add Event</Text>
				<View style={styles.iconCircle}>
					<Icon name="plus" family="feather" size={18} color="#FFFFFF" />
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
		justifyContent: "space-between",
		alignSelf: "stretch",
		width: "100%",
		backgroundColor: Colors.event.background,
		borderWidth: 1.5,
		borderStyle: "dashed",
		borderColor: Colors.glass.borderDashed,
		borderRadius: 22,
		minHeight: 82,
		paddingHorizontal: 22,
		paddingVertical: 14,
		overflow: "hidden",
		...Shadows.event
	},
	pulseBorder: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 22,
		borderWidth: 1.5,
		borderStyle: "dashed"
	},
	label: {
		fontSize: 17,
		lineHeight: 23,
		color: Colors.event.title
	},
	iconCircle: {
		width: 35,
		height: 35,
		borderRadius: 17.5,
		backgroundColor: "rgba(255,255,255,0.12)",
		alignItems: "center",
		justifyContent: "center"
	}
});

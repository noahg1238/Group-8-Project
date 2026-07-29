import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { PRESS_SCALE, springPress } from "../../design/motion";

export type HapticStyle = "light" | "medium" | "heavy" | "selection" | "none";

export interface AnimatedPressableProps extends Omit<PressableProps, "style"> {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	pressScale?: number; // Target scale when pressed (default 0.97)
	haptic?: HapticStyle; // Haptic feedback style on press in
	disabled?: boolean;
}

async function triggerHaptic(style: HapticStyle): Promise<void> {
	switch (style) {
		case "light":
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			break;
		case "medium":
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			break;
		case "heavy":
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
			break;
		case "selection":
			await Haptics.selectionAsync();
			break;
		default:
			break;
	}
}

export function AnimatedPressable({ children, style, pressScale = PRESS_SCALE, haptic = "light", disabled = false, onPressIn, onPressOut, ...props }: AnimatedPressableProps) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }]
	}));

	const handlePressIn = useCallback(
		(event: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
			if (!disabled) {
				scale.value = withSpring(pressScale, springPress);
				if (haptic !== "none") {
					void triggerHaptic(haptic);
				}
			}
			onPressIn?.(event);
		},
		[disabled, haptic, onPressIn, pressScale, scale]
	);

	const handlePressOut = useCallback(
		(event: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
			scale.value = withSpring(1, springPress);
			onPressOut?.(event);
		},
		[onPressOut, scale]
	);

	return (
		<Pressable disabled={disabled} onPressIn={handlePressIn} onPressOut={handlePressOut} style={style} {...props}>
			<Animated.View style={[style, styles.fill, animatedStyle]}>{children}</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	fill: {
		// Keep press scale on a full-size layer without owning layout direction
		alignSelf: "stretch"
	}
});


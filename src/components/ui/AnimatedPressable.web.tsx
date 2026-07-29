import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
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
	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePressIn = useCallback(
		(event: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
			if (!disabled) {
				Animated.spring(scaleAnim, {
					toValue: pressScale,
					useNativeDriver: true,
					...springPress
				}).start();
				if (haptic !== "none") {
					void triggerHaptic(haptic);
				}
			}
			onPressIn?.(event);
		},
		[disabled, haptic, onPressIn, pressScale, scaleAnim]
	);

	const handlePressOut = useCallback(
		(event: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
				...springPress
			}).start();
			onPressOut?.(event);
		},
		[onPressOut, scaleAnim]
	);

	return (
		<Pressable disabled={disabled} onPressIn={handlePressIn} onPressOut={handlePressOut} style={style} {...props}>
			<Animated.View style={[style, { alignSelf: "stretch", transform: [{ scale: scaleAnim }] }]}>{children}</Animated.View>
		</Pressable>
	);
}

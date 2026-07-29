import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { GlassColors } from "../../design/tokens";

export interface GlassToggleProps {
	value: boolean;
	onValueChange: (value: boolean) => void;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
}

const TRACK_W = 51;
const TRACK_H = 31;
const THUMB = 27;
const PAD = 2;
const TRAVEL = TRACK_W - THUMB - PAD * 2;

export function GlassToggle({ value, onValueChange, disabled = false, style }: GlassToggleProps) {
	const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

	useEffect(() => {
		Animated.spring(progress, { toValue: value ? 1 : 0, friction: 6, tension: 180, useNativeDriver: false }).start();
	}, [value, progress]);

	const thumbX = progress.interpolate({ inputRange: [0, 1], outputRange: [PAD, PAD + TRAVEL] });
	const trackBg = progress.interpolate({ inputRange: [0, 1], outputRange: [GlassColors.toggleOff, GlassColors.accent] });

	return (
		<Pressable onPress={() => !disabled && onValueChange(!value)} disabled={disabled} accessibilityRole="switch" accessibilityState={{ checked: value, disabled }} hitSlop={8} style={({ pressed }) => [styles.hit, disabled && styles.disabled, pressed && !disabled && styles.pressed, style]}>
			<Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
				<Animated.View style={[styles.thumb, { transform: [{ translateX: thumbX }] }]} />
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	hit: {
		width: TRACK_W,
		height: TRACK_H,
		flexShrink: 0
	},
	track: {
		width: TRACK_W,
		height: TRACK_H,
		borderRadius: TRACK_H / 2,
		overflow: "hidden",
		justifyContent: "center"
	},
	thumb: {
		position: "absolute",
		top: PAD,
		left: 0,
		width: THUMB,
		height: THUMB,
		borderRadius: THUMB / 2,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.22,
		shadowRadius: 2.5,
		elevation: 3
	},
	pressed: { opacity: 0.88 },
	disabled: { opacity: 0.4 }
});

import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { Colors } from "../../design/tokens";
import { AnimatedPressable } from "./AnimatedPressable";
import { LiquidGlassCard } from "./LiquidGlassCard";

export interface PasskeyKeyProps {
	label?: string;
	children?: React.ReactNode;
	onPress: () => void;
	variant?: "default" | "wide" | "action";
	disabled?: boolean;
	accessibilityLabel?: string;
	style?: StyleProp<ViewStyle>;
}

export function PasskeyKey({ label, children, onPress, variant = "default", disabled = false, accessibilityLabel, style }: PasskeyKeyProps) {
	const isWide = variant === "wide";
	const isAction = variant === "action";

	return (
		<AnimatedPressable onPress={onPress} disabled={disabled} haptic="light" accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label ?? "Keypad key"} style={[styles.wrapper, isWide && styles.wrapperWide, disabled && styles.disabled, style]}>
			<LiquidGlassCard size="small" style={[styles.key, isWide && styles.keyWide]}>
				{children ?? <Text style={[styles.label, isAction && styles.labelAction]}>{label}</Text>}
			</LiquidGlassCard>
		</AnimatedPressable>
	);
}

export const PASSKEY_KEY_SIZE = 100;
export const PASSKEY_KEY_GAP = 15;

const styles = StyleSheet.create({
	wrapper: {
		width: PASSKEY_KEY_SIZE,
		height: PASSKEY_KEY_SIZE,
		borderRadius: PASSKEY_KEY_SIZE / 2,
		overflow: "hidden"
	},
	wrapperWide: {
		width: PASSKEY_KEY_SIZE * 2 + PASSKEY_KEY_GAP
	},
	key: {
		width: "100%",
		height: "100%",
		borderRadius: PASSKEY_KEY_SIZE / 2,
		overflow: "hidden"
	},
	keyWide: {
		width: "100%"
	},
	label: {
		fontSize: 28,
		fontWeight: "400",
		color: Colors.text.primary
	},
	labelAction: {
		fontSize: 16,
		fontWeight: "500",
		color: Colors.text.secondary
	},
	disabled: {
		opacity: 0.35
	}
});

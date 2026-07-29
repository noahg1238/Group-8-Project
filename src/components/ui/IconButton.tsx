import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Icon, IconFamily } from "./Icon";

export interface IconButtonProps {
	name: string;
	family?: IconFamily;
	size?: number;
	color?: string;
	onPress: () => void;
	disabled?: boolean;
	style?: ViewStyle;
}

export function IconButton({ name, family = "feather", size = 24, color = "#007AFF", onPress, disabled = false, style }: IconButtonProps) {
	return (
		<Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled, style]}>
			<Icon name={name} family={family} size={size} color={color} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		justifyContent: "center",
		width: 44,
		height: 44,
		borderRadius: 22
	},
	pressed: {
		opacity: 0.6,
		backgroundColor: "#F2F2F7"
	},
	disabled: {
		opacity: 0.4
	}
});

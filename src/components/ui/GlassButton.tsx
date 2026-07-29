import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { BorderRadius, Colors, Shadows, Spacing } from "../../design/tokens";
import { AnimatedPressable } from "./AnimatedPressable";

export interface GlassButtonProps {
	children?: React.ReactNode;
	title?: string;
	variant?: "primary" | "secondary" | "ghost" | "dashed";
	size?: "sm" | "md" | "lg";
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function GlassButton({ children, title, variant = "primary", size = "md", onPress, disabled = false, loading = false, style }: GlassButtonProps) {
	return (
		<AnimatedPressable onPress={onPress} disabled={disabled || loading} haptic="medium" style={[styles.base, sizeStyles[size], variantStyles[variant], (disabled || loading) && styles.disabled, style]} accessibilityRole="button">
			{loading ? <ActivityIndicator size="small" color={variant === "primary" ? Colors.accent.ctaText : Colors.accent.teal} /> : <Text style={[styles.text, textVariantStyles[variant], textSizeStyles[size]]}>{title ?? children}</Text>}
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create({
	base: {
		alignItems: "center",
		justifyContent: "center"
	},
	text: {
		fontWeight: "600"
	},
	disabled: {
		opacity: 0.45
	}
});

const sizeStyles: Record<string, ViewStyle> = {
	sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base, borderRadius: BorderRadius.event },
	md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.event },
	lg: {
		height: 52,
		paddingHorizontal: Spacing.xl,
		borderRadius: BorderRadius.pill
	}
};

const variantStyles: Record<string, ViewStyle> = {
	primary: {
		backgroundColor: Colors.accent.cta,
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.20)",
		...Shadows.cta
	},
	secondary: {
		backgroundColor: Colors.glass.fillMedium,
		borderWidth: 1,
		borderColor: Colors.glass.border,
		borderRadius: BorderRadius.event,
		...Shadows.sm
	},
	ghost: {
		backgroundColor: "transparent",
		borderRadius: BorderRadius.event
	},
	dashed: {
		backgroundColor: "transparent",
		borderWidth: 1.5,
		borderColor: Colors.border.dashed,
		borderStyle: "dashed",
		borderRadius: BorderRadius.event
	}
};

const textVariantStyles: Record<string, TextStyle> = {
	primary: { color: Colors.accent.ctaText },
	secondary: { color: Colors.text.primary },
	ghost: { color: Colors.accent.teal },
	dashed: { color: Colors.text.secondary }
};

const textSizeStyles: Record<string, TextStyle> = {
	sm: { fontSize: 13 },
	md: { fontSize: 15 },
	lg: { fontSize: 17 }
};

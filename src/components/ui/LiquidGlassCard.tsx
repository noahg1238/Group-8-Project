import React, { useState } from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { BorderRadius, Colors, Shadows, Spacing } from "../../design/tokens";
import { AnimatedPressable } from "./AnimatedPressable";
import { GlassDepthLayer } from "./GlassDepthLayer";
export type LiquidGlassSize = "small" | "medium" | "large";
export type LiquidGlassTint = "default" | "toolbar" | "blue" | "green" | "field";
export type LiquidGlassTone = "default" | "field";

export interface LiquidGlassCardProps {
	children: React.ReactNode;
	size?: LiquidGlassSize;
	tint?: LiquidGlassTint;
	tone?: LiquidGlassTone;
	className?: string;
	style?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
	noPadding?: boolean;
	pressable?: boolean; // Enable press-reactive blur depth
	onPress?: () => void;
	shimmer?: boolean; // Subtle specular shimmer
}

const sizeConfig: Record<
	LiquidGlassSize,
	{
		borderRadius: number;
		padding: number;
		blurIntensity: number;
		blurActive: number;
		webClass: string;
	}
> = {
	small: {
		borderRadius: BorderRadius.full,
		padding: 0,
		blurIntensity: Colors.glass.blurSmall,
		blurActive: Colors.glass.blurSmall + 6,
		webClass: "liquid-glass-small"
	},
	medium: {
		borderRadius: BorderRadius.glass,
		padding: Spacing.base,
		blurIntensity: Colors.glass.blur,
		blurActive: Colors.glass.blur + 8,
		webClass: "liquid-glass"
	},
	large: {
		borderRadius: BorderRadius.event,
		padding: Spacing.lg,
		blurIntensity: Colors.glass.blurLarge,
		blurActive: Colors.glass.blurLarge + 10,
		webClass: "liquid-glass-large"
	}
};

function resolveFill(tint: LiquidGlassTint, tone: LiquidGlassTone): string {
	if (tone === "field") return Colors.event.background;
	switch (tint) {
		case "toolbar":
			return Colors.glass.fillSmall;
		case "blue":
			return "rgba(81, 149, 226, 0.12)";
		case "green":
			return Colors.event.background;
		case "field":
			return Colors.event.background;
		default:
			return Colors.glass.fillMedium;
	}
}

function resolveHighlight(tint: LiquidGlassTint, tone: LiquidGlassTone): string {
	if (tone === "field" || tint === "green" || tint === "field") {
		return "rgba(255, 255, 255, 0.10)";
	}
	if (tint === "blue") {
		return "rgba(81, 149, 226, 0.22)";
	}
	if (tint === "toolbar") {
		return "rgba(255, 255, 255, 0.20)";
	}
	return "rgba(255, 255, 255, 0.16)";
}

export function LiquidGlassCard({ children, size = "medium", tint = "default", tone = "default", className, style, contentStyle, noPadding = false, pressable = false, onPress, shimmer = false }: LiquidGlassCardProps) {
	const [pressed, setPressed] = useState(false);
	const config = sizeConfig[size];
	const padding = noPadding ? 0 : config.padding;
	const fill = resolveFill(tint, tone);
	const highlight = resolveHighlight(tint, tone);
	const isSmall = size === "small";
	const isActive = pressed;
	const webClass = tone === "field" || tint === "green" ? "liquid-glass-event" : (className ?? config.webClass);

	const nativeShellStyle: ViewStyle = {
		borderRadius: config.borderRadius,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: Colors.glass.border,
		...(size === "large" || tone === "field" || tint === "green"
			? Shadows.event
			: size === "small"
				? {
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.2,
						shadowRadius: 12,
						elevation: 4
					}
				: Shadows.glass)
	};

	const contentWrapper = <View style={[isSmall ? styles.contentCentered : styles.content, padding > 0 && { padding }, contentStyle]}>{children}</View>;

	const cardBody =
		Platform.OS === "web" ? (
			<GlassDepthLayer blurIntensity={config.blurIntensity} blurIntensityActive={config.blurActive} active={isActive} borderRadius={config.borderRadius} fillColor={fill} fillHighlight={highlight} webClass={webClass} shimmer={shimmer} noise style={[{ borderRadius: config.borderRadius }, style]} contentStyle={contentStyle}>
				<View style={[isSmall ? styles.contentCentered : styles.content, padding > 0 && { padding }]}>{children}</View>
			</GlassDepthLayer>
		) : (
			<View style={[nativeShellStyle, style]}>
				<GlassDepthLayer blurIntensity={config.blurIntensity} blurIntensityActive={config.blurActive} active={isActive} borderRadius={config.borderRadius} fillColor={fill} fillHighlight={highlight} shimmer={shimmer} style={StyleSheet.absoluteFill} />
				{contentWrapper}
			</View>
		);

	if (pressable || onPress) {
		return (
			<AnimatedPressable onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)} haptic="light" accessibilityRole="button">
				{cardBody}
			</AnimatedPressable>
		);
	}

	return cardBody;
}

const styles = StyleSheet.create({
	content: {
		position: "relative",
		zIndex: 2
	},
	contentCentered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2
	}
});

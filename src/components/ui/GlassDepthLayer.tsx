import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { springPress, startGlassShimmer } from "../../design/motion";
import { Colors } from "../../design/tokens";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export interface GlassDepthLayerProps {
	children?: React.ReactNode;
	blurIntensity?: number; // Base blur intensity (native)
	blurIntensityActive?: number; // Blur boost when pressed/focused
	active?: boolean; // Whether the layer is in active (pressed/focused) state
	borderRadius?: number;
	fillColor?: string; // Primary tint fill (bottom of gradient)
	fillHighlight?: string; // Top highlight tint (top of gradient)
	webClass?: string; // Web CSS class for liquid glass variant
	shimmer?: boolean; // Enable subtle shimmer on specular highlight
	noise?: boolean; // Show noise texture (web only via CSS)
	style?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
}

const DEFAULT_FILL = Colors.glass.fillMedium;
const DEFAULT_HIGHLIGHT = "rgba(255, 255, 255, 0.16)";
const SPECULAR = Colors.glass.highlight;
const INNER_SHADOW = "rgba(0, 0, 0, 0.28)";

export function GlassDepthLayer({ children, blurIntensity = Colors.glass.blur, blurIntensityActive, active = false, borderRadius = 20, fillColor = DEFAULT_FILL, fillHighlight = DEFAULT_HIGHLIGHT, webClass = "liquid-glass", shimmer = false, noise = true, style, contentStyle }: GlassDepthLayerProps) {
	const intensity = useSharedValue(blurIntensity);
	const shimmerOpacity = useSharedValue(0.4);
	const activeIntensity = blurIntensityActive ?? blurIntensity + 8;

	useEffect(() => {
		intensity.value = withSpring(active ? activeIntensity : blurIntensity, springPress);
	}, [active, blurIntensity, activeIntensity, intensity]);

	useEffect(() => {
		if (shimmer) {
			startGlassShimmer(shimmerOpacity);
		}
	}, [shimmer, shimmerOpacity]);

	const blurProps = useAnimatedProps(() => ({
		intensity: intensity.value
	}));

	const shimmerStyle = useAnimatedStyle(() => ({
		opacity: shimmer ? shimmerOpacity.value * 0.6 : 0.35
	}));

	const radiusStyle = { borderRadius, overflow: "hidden" as const };

	if (Platform.OS === "web") {
		const webClasses = [webClass, noise && "liquid-glass-noise"].filter(Boolean).join(" ");

		return (
			<View className={webClasses} style={[radiusStyle, styles.webContainer, style]}>
				<View style={[styles.content, contentStyle]}>{children}</View>
			</View>
		);
	}

	return (
		<View style={[radiusStyle, styles.container, style]}>
			<AnimatedBlurView animatedProps={blurProps} tint="dark" style={StyleSheet.absoluteFill} />

			<LinearGradient colors={[fillHighlight, fillColor, "rgba(0, 0, 0, 0.18)"]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

			{/* Specular top-edge highlight */}
			<Animated.View style={[styles.specular, { backgroundColor: SPECULAR }, shimmerStyle]} />

			{/* Inner shadow simulation — bottom edge */}
			<LinearGradient colors={["transparent", INNER_SHADOW]} locations={[0.7, 1]} style={styles.innerShadow} pointerEvents="none" />

			<View style={[styles.content, contentStyle]}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "relative"
	},
	webContainer: {
		position: "relative"
	},
	content: {
		position: "relative",
		zIndex: 2
	},
	specular: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 1,
		zIndex: 1
	},
	innerShadow: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1
	}
});

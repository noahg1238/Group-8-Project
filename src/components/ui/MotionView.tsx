// Cross-platform enter motion (RN Animated — works on web + native)
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";
import { Animation } from "../../design/tokens";

export type MotionEnter = "fade" | "fadeUp" | "fadeDown" | "scale" | "slide" | "none";

export interface MotionViewProps {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	enter?: MotionEnter;
	delay?: number;
	duration?: number;
	fromY?: number;
	fromX?: number;
	fromScale?: number;
	easing?: Animated.TimingAnimationConfig["easing"];
	pointerEvents?: "auto" | "none" | "box-none" | "box-only";
}

const easeInOut = Easing.inOut(Easing.cubic);

export function MotionView({ children, style, enter = "fadeUp", delay = 0, duration = Animation.duration.normal, fromY = 14, fromX = 24, fromScale = 0.96, easing = easeInOut, pointerEvents }: MotionViewProps) {
	const isSlide = enter === "slide";
	const opacity = useRef(new Animated.Value(enter === "none" ? 1 : 0)).current;
	const translateY = useRef(new Animated.Value(enter === "fadeUp" ? fromY : enter === "fadeDown" ? -fromY : 0)).current;
	const translateX = useRef(new Animated.Value(isSlide ? fromX : 0)).current;
	const scale = useRef(new Animated.Value(enter === "scale" ? fromScale : 1)).current;

	useEffect(() => {
		if (enter === "none") return;
		const anim = Animated.parallel([
			Animated.timing(opacity, { toValue: 1, duration, delay, easing, useNativeDriver: true }),
			enter === "fadeUp" || enter === "fadeDown" ? Animated.timing(translateY, { toValue: 0, duration, delay, easing, useNativeDriver: true }) : Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
			isSlide ? Animated.timing(translateX, { toValue: 0, duration, delay, easing, useNativeDriver: true }) : Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
			enter === "scale" ? Animated.spring(scale, { toValue: 1, friction: 7, tension: 100, delay, useNativeDriver: true }) : Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true })
		]);
		anim.start();
		return () => anim.stop();
	}, [enter, delay, duration, easing, isSlide, opacity, translateY, translateX, scale]);

	if (enter === "none") return <Animated.View style={style} pointerEvents={pointerEvents}>{children}</Animated.View>;

	return (
		<Animated.View style={[style, { opacity, transform: [{ translateX }, { translateY }, { scale }] }]} pointerEvents={pointerEvents}>
			{children}
		</Animated.View>
	);
}

export function staggerMs(index: number, base = 40): number {
	return index * base;
}

/** Figma prototype timings (PlanB file reactions) */
export const PrototypeMotion = {
	smartAnimateMs: 340,
	pushMs: 350,
	dissolveMs: 220,
	createDissolveMs: 320,
	slideDistance: 36
} as const;

// iOS-style horizontal push for web (full-width translateX, no fade)
import { usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Platform, StyleSheet } from "react-native";
import { PrototypeMotion } from "./MotionView";

const PUSH_ROUTES = new Set(["/settings", "/add_event_page", "/event_details", "/passkey_page"]);
const FADE_ROUTES = new Set(["/year_overview"]);
const ease = Easing.bezier(0.32, 0.72, 0, 1);

function screenWidth() {
	return Dimensions.get("window").width || 400;
}

export function useIosPushTransition(onBack?: () => void) {
	const pathname = usePathname();
	const isPush = PUSH_ROUTES.has(pathname);
	const isFade = FADE_ROUTES.has(pathname);
	const translateX = useRef(new Animated.Value(Platform.OS === "web" && isPush ? screenWidth() : 0)).current;
	const opacity = useRef(new Animated.Value(Platform.OS === "web" && isFade ? 0 : 1)).current;
	const exiting = useRef(false);
	const booted = useRef(false);

	useEffect(() => {
		if (Platform.OS !== "web" || booted.current) return;
		booted.current = true;

		if (isPush) {
			opacity.setValue(1);
			Animated.timing(translateX, {
				toValue: 0,
				duration: PrototypeMotion.pushMs,
				easing: ease,
				useNativeDriver: true
			}).start();
			return;
		}

		if (isFade) {
			translateX.setValue(0);
			Animated.timing(opacity, {
				toValue: 1,
				duration: PrototypeMotion.smartAnimateMs,
				easing: Easing.inOut(Easing.cubic),
				useNativeDriver: true
			}).start();
		}
	}, [isPush, isFade, opacity, translateX]);

	const animatedBack = useCallback(() => {
		if (!onBack) return;
		if (Platform.OS !== "web" || exiting.current) {
			onBack();
			return;
		}
		exiting.current = true;
		Animated.timing(translateX, {
			toValue: screenWidth(),
			duration: PrototypeMotion.pushMs,
			easing: ease,
			useNativeDriver: true
		}).start(({ finished }) => {
			if (finished) onBack();
			else exiting.current = false;
		});
	}, [onBack, translateX]);

	const style =
		Platform.OS === "web"
			? {
					flex: 1 as const,
					opacity,
					transform: [{ translateX }]
				}
			: styles.fill;

	return { animatedBack, style, AnimatedView: Animated.View };
}

const styles = StyleSheet.create({
	fill: { flex: 1 }
});

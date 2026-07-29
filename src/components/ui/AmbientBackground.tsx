import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { Colors } from "../../design/tokens";

export function AmbientBackground() {
	const driftA = useRef(new Animated.Value(0)).current;
	const driftB = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const loopA = Animated.loop(
			Animated.sequence([
				Animated.timing(driftA, { toValue: 1, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
				Animated.timing(driftA, { toValue: 0, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
			])
		);
		const loopB = Animated.loop(
			Animated.sequence([
				Animated.timing(driftB, { toValue: 1, duration: 16000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
				Animated.timing(driftB, { toValue: 0, duration: 16000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
			])
		);
		loopA.start();
		loopB.start();
		return () => {
			loopA.stop();
			loopB.stop();
		};
	}, [driftA, driftB]);

	const orbAStyle = {
		transform: [
			{ translateX: driftA.interpolate({ inputRange: [0, 1], outputRange: [-9, 9] }) },
			{ translateY: driftA.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }) },
			{ scale: driftA.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }
		],
		opacity: driftA.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.7] })
	};

	const orbBStyle = {
		transform: [
			{ translateX: driftB.interpolate({ inputRange: [0, 1], outputRange: [11, -11] }) },
			{ translateY: driftB.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] }) },
			{ scale: driftB.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1.09] }) }
		],
		opacity: driftB.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.57] })
	};

	if (Platform.OS === "web") {
		return <View pointerEvents="none" className="glass-ambient-bg" style={[StyleSheet.absoluteFill, styles.webAmbient]} />;
	}

	return (
		<View pointerEvents="none" style={StyleSheet.absoluteFill}>
			<Animated.View style={[styles.orb, styles.orbBlue, orbAStyle]}>
				<LinearGradient colors={["rgba(81, 149, 226, 0.35)", "rgba(81, 149, 226, 0)"]} style={StyleSheet.absoluteFill} />
			</Animated.View>
			<Animated.View style={[styles.orb, styles.orbTeal, orbBStyle]}>
				<LinearGradient colors={["rgba(78, 205, 196, 0.28)", "rgba(78, 205, 196, 0)"]} style={StyleSheet.absoluteFill} />
			</Animated.View>
			<Animated.View style={[styles.orb, styles.orbViolet, orbBStyle]}>
				<LinearGradient colors={["rgba(120, 90, 200, 0.18)", "rgba(120, 90, 200, 0)"]} style={StyleSheet.absoluteFill} />
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	webAmbient: {
		backgroundColor: Colors.screen
	},
	orb: {
		position: "absolute",
		borderRadius: 9999,
		overflow: "hidden"
	},
	orbBlue: {
		width: 280,
		height: 280,
		top: -40,
		left: -60
	},
	orbTeal: {
		width: 320,
		height: 320,
		bottom: 80,
		right: -80
	},
	orbViolet: {
		width: 200,
		height: 200,
		top: "38%",
		right: "10%"
	}
});

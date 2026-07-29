import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Event } from "../../database/types";
import { BorderRadius, Colors, Shadows } from "../../design/tokens";
import { Icon } from "../ui/Icon";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { MotionView, staggerMs } from "../ui/MotionView";

export interface EventDetailCardProps {
	event: Event;
	whenLabel: string;
	calendarLabel: string;
	isOnline?: boolean;
	onActionPress?: () => void;
	onLocationPress?: () => void;
}

function buildMapsUrl(address: string): string {
	const encoded = encodeURIComponent(address);
	if (Platform.OS === "ios") return `maps:?q=${encoded}`;
	if (Platform.OS === "android") return `geo:0,0?q=${encoded}`;
	return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

export async function openEventLocation(address: string): Promise<void> {
	const url = buildMapsUrl(address);
	const canOpen = await Linking.canOpenURL(url);
	if (canOpen) {
		await Linking.openURL(url);
		return;
	}
	await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
}

function MapPlaceholder({ address }: { address: string }) {
	const shimmerX = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const loop = Animated.loop(
			Animated.timing(shimmerX, {
				toValue: 1,
				duration: 5000,
				easing: Easing.inOut(Easing.ease),
				useNativeDriver: true
			})
		);
		loop.start();
		return () => loop.stop();
	}, [shimmerX]);

	const parallaxStyle = {
		transform: [{ translateX: shimmerX.interpolate({ inputRange: [0, 1], outputRange: [-5.4, 18] }) }]
	};
	const shimmerStyle = {
		transform: [{ translateX: shimmerX.interpolate({ inputRange: [0, 1], outputRange: [-60, 96] }) }],
		opacity: shimmerX.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 0.6, 0.25] })
	};

	return (
		<View style={styles.mapContainer}>
			{Platform.OS === "web" ? (
				<View style={styles.mapFillWeb} />
			) : (
				<Animated.View style={[styles.mapLayer, parallaxStyle]}>
					<LinearGradient colors={["#1E2D37", "#2A4555", "#3D6278", "#2A4555", "#1E2D37"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mapFill} />
					<Animated.View style={[styles.mapShimmerBand, shimmerStyle]}>
						<LinearGradient colors={["transparent", "rgba(129, 180, 210, 0.35)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
					</Animated.View>
				</Animated.View>
			)}

			<View style={styles.mapPin}>
				<Icon name="map-pin" family="feather" size={26} color={Colors.text.accent} />
			</View>

			{address ? (
				<MotionView enter="fadeUp" delay={420} style={styles.addressWrapper}>
					<View style={styles.addressBubble}>
						<Text style={styles.addressText}>{address}</Text>
					</View>
					<View style={styles.addressArrow} />
				</MotionView>
			) : null}
		</View>
	);
}

function DetailSection({ label, value, index }: { label: string; value: string; index: number }) {
	return (
		<MotionView enter="fadeDown" delay={180 + staggerMs(index, 80)} style={styles.section}>
			<Text style={styles.sectionLabel}>{label}</Text>
			<Text style={styles.sectionValue}>{value}</Text>
		</MotionView>
	);
}

export function EventDetailCard({ event, whenLabel, calendarLabel, isOnline = false, onActionPress, onLocationPress }: EventDetailCardProps) {
	const locationText = event.location?.trim() ?? "";

	const handleLocationPress = () => {
		if (onLocationPress) {
			onLocationPress();
			return;
		}
		if (locationText) void openEventLocation(locationText);
	};

	return (
		<MotionView enter="fadeUp" fromY={20} duration={280} style={styles.card}>
			<View style={styles.headerRow}>
				<View style={styles.titleBlock}>
					<Text style={styles.title}>{event.title}</Text>
					{isOnline ? <Text style={styles.onlineSubtitle}>Online event</Text> : null}
				</View>
				<Pressable style={styles.actionChip} onPress={onActionPress} hitSlop={8} accessibilityRole="button" accessibilityLabel="Event actions">
					<Icon name="chevron-right" family="feather" size={18} color={Colors.event.chevron} />
				</Pressable>
			</View>

			<View style={styles.divider} />

			<DetailSection label="WHEN" value={whenLabel} index={0} />
			<DetailSection label="CALENDAR" value={calendarLabel} index={1} />

			<MotionView enter="fadeDown" delay={180 + staggerMs(2, 80)} style={styles.locationSection}>
				<Text style={styles.sectionLabel}>LOCATION</Text>
				<Pressable onPress={handleLocationPress} disabled={!locationText} style={({ pressed }) => [styles.locationFieldPressable, pressed && locationText ? styles.locationFieldPressed : null]} accessibilityRole="button" accessibilityLabel={locationText ? `Open location: ${locationText}` : "Location"}>
					<LiquidGlassCard tint="field" noPadding style={styles.locationFieldCard}>
						<View style={styles.locationField}>
							<Icon name="search" family="feather" size={16} color={Colors.event.subtitle} />
							<TextInput style={styles.locationInput} placeholder="Location" placeholderTextColor={Colors.text.placeholder} value={locationText} editable={false} pointerEvents="none" />
							<Icon name="mic" family="feather" size={16} color={Colors.event.subtitle} />
						</View>
					</LiquidGlassCard>
				</Pressable>
			</MotionView>

			<MotionView enter="fadeDown" delay={180 + staggerMs(4, 80)}>
				<MapPlaceholder address={locationText} />
			</MotionView>
		</MotionView>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.event.background,
		borderWidth: 1,
		borderColor: Colors.event.border,
		borderRadius: BorderRadius.event,
		paddingHorizontal: 20,
		paddingTop: 15,
		paddingBottom: 15,
		...Shadows.event
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: 12
	},
	titleBlock: {
		flex: 1,
		paddingTop: 0
	},
	title: {
		fontSize: 17,
		fontWeight: "600",
		color: Colors.event.title,
		lineHeight: 22
	},
	onlineSubtitle: {
		marginTop: 8,
		fontSize: 14,
		color: Colors.event.subtitle,
		textDecorationLine: "underline"
	},
	actionChip: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.surface.elevated,
		marginTop: 4
	},
	divider: {
		height: 1,
		backgroundColor: Colors.surface.elevated,
		marginTop: 10,
		marginBottom: 14
	},
	section: {
		marginBottom: 18
	},
	sectionLabel: {
		fontSize: 12,
		color: "#8CA69E",
		letterSpacing: 0.4,
		marginBottom: 6,
		textTransform: "uppercase"
	},
	sectionValue: {
		fontSize: 14,
		color: "#EBF2F0",
		lineHeight: 20
	},
	locationSection: {
		marginBottom: 12
	},
	locationFieldPressable: {
		marginTop: 2
	},
	locationFieldCard: {
		borderRadius: BorderRadius.large,
		overflow: "hidden"
	},
	locationField: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 14,
		paddingVertical: 11,
		minHeight: 44
	},
	locationFieldPressed: {
		opacity: 0.85
	},
	locationInput: {
		flex: 1,
		fontSize: 14,
		color: Colors.event.subtitle,
		padding: 0
	},
	mapContainer: {
		width: "100%",
		aspectRatio: 16 / 9,
		borderRadius: BorderRadius.large,
		borderWidth: 1,
		borderColor: Colors.event.border,
		overflow: "hidden",
		backgroundColor: "rgba(0,0,0,0.25)"
	},
	mapLayer: {
		...StyleSheet.absoluteFillObject,
		overflow: "hidden"
	},
	mapFill: {
		...StyleSheet.absoluteFillObject,
		width: "115%",
		height: "115%",
		left: "-7%",
		top: "-7%"
	},
	mapFillWeb: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(30, 45, 55, 0.9)"
	},
	mapShimmerBand: {
		position: "absolute",
		top: 0,
		bottom: 0,
		width: "45%"
	},
	mapPin: {
		position: "absolute",
		top: "22%",
		alignSelf: "center",
		zIndex: 2
	},
	addressWrapper: {
		position: "absolute",
		top: "58%",
		left: 0,
		right: 0,
		alignItems: "center",
		zIndex: 3,
		paddingHorizontal: 16
	},
	addressBubble: {
		backgroundColor: "rgba(15, 15, 20, 0.88)",
		borderRadius: 8,
		paddingHorizontal: 17,
		paddingVertical: 11,
		maxWidth: "92%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 8
	},
	addressArrow: {
		width: 0,
		height: 0,
		borderLeftWidth: 6,
		borderRightWidth: 6,
		borderTopWidth: 6,
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderTopColor: "rgba(15, 15, 20, 0.88)",
		marginTop: -1
	},
	addressText: {
		fontSize: 11,
		fontWeight: "500",
		color: Colors.text.primary,
		lineHeight: 16,
		textAlign: "center"
	}
});

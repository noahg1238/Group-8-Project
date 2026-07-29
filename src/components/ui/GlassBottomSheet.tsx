import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BorderRadius, GlassColors, Spacing } from "../../design/tokens";
import { LiquidGlassCard } from "./LiquidGlassCard";

export interface GlassBottomSheetProps {
	visible: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	contentStyle?: StyleProp<ViewStyle>;
}

const OFFSCREEN = 480;

export function GlassBottomSheet({ visible, onClose, title, children, contentStyle }: GlassBottomSheetProps) {
	const insets = useSafeAreaInsets();
	const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
	const backdropOpacity = useRef(new Animated.Value(0)).current;
	const [mounted, setMounted] = React.useState(visible);
	const animRef = useRef<Animated.CompositeAnimation | null>(null);
	const wasOpen = useRef(visible);

	useEffect(() => {
		if (Platform.OS === "web" && typeof document !== "undefined") {
			if (visible && mounted) document.body.style.overflow = "hidden";
			else document.body.style.overflow = "";
		}
		return () => {
			if (Platform.OS === "web" && typeof document !== "undefined") document.body.style.overflow = "";
		};
	}, [visible, mounted]);

	useEffect(() => {
		animRef.current?.stop();
		if (visible) {
			wasOpen.current = true;
			setMounted(true);
			translateY.setValue(OFFSCREEN);
			backdropOpacity.setValue(0);
			animRef.current = Animated.parallel([
				Animated.timing(backdropOpacity, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
				Animated.spring(translateY, { toValue: 0, damping: 26, stiffness: 280, mass: 0.85, useNativeDriver: true })
			]);
			animRef.current.start();
		} else if (wasOpen.current) {
			animRef.current = Animated.parallel([
				Animated.timing(backdropOpacity, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
				Animated.timing(translateY, { toValue: OFFSCREEN, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true })
			]);
			animRef.current.start(({ finished }) => {
				if (finished) {
					wasOpen.current = false;
					setMounted(false);
				}
			});
		}
		return () => animRef.current?.stop();
	}, [visible, backdropOpacity, translateY]);

	if (!mounted) return null;

	return (
		<Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
			<View style={styles.root}>
				<Animated.View style={[styles.backdrop, { opacity: backdropOpacity }, visible ? undefined : styles.backdropHidden]}>
					{Platform.OS === "ios" ? <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} /> : null}
					<Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
				</Animated.View>

				<Animated.View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, Spacing.base) }, { transform: [{ translateY }] }]}>
					<LiquidGlassCard size="large" tint="field" noPadding style={styles.sheet}>
						<View style={styles.handleRow}>
							<View style={styles.handle} />
						</View>
						{title ? <Text style={styles.title}>{title}</Text> : null}
						<View style={[styles.content, contentStyle]}>{children}</View>
					</LiquidGlassCard>
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		justifyContent: "flex-end"
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.55)"
	},
	backdropHidden: {
		pointerEvents: "none"
	},
	sheetContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: Spacing.base
	},
	sheet: {
		borderRadius: BorderRadius.event,
		overflow: "hidden"
	},
	handleRow: {
		alignItems: "center",
		paddingTop: Spacing.sm,
		paddingBottom: Spacing.xs
	},
	handle: {
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: "rgba(255, 255, 255, 0.25)"
	},
	title: {
		fontSize: 17,
		fontWeight: "600",
		color: GlassColors.label,
		textAlign: "center",
		paddingHorizontal: Spacing.lg,
		paddingBottom: Spacing.sm
	},
	content: {
		paddingHorizontal: Spacing.base,
		paddingBottom: Spacing.base
	}
});

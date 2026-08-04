import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassScreen } from "../components/ui/GlassScreen";
import { Icon } from "../components/ui/Icon";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { MotionView, staggerMs } from "../components/ui/MotionView";
import { PASSKEY_KEY_GAP, PASSKEY_KEY_SIZE, PasskeyKey } from "../components/ui/PasskeyKey";
import { hasPassword, setupPassword, verifyPassword } from "../database/auth";
import { useAuthStore } from "../database/stores";
import { BorderRadius, Colors, Shadows, Spacing } from "../design/tokens";

const PASSKEY_LENGTH = 4;
const DOT_COUNT = 4;
type PasskeyMode = "verify" | "create" | "confirm";

function PinDot({ filled }: { filled: boolean }) {
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const wasFilled = useRef(filled);

	useEffect(() => {
		if (filled && !wasFilled.current) {
			scaleAnim.setValue(0.35);
			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
				friction: 4,
				tension: 220
			}).start();
		}
		wasFilled.current = filled;
	}, [filled, scaleAnim]);

	return <Animated.View style={[styles.dot, filled ? styles.dotFilled : styles.dotEmpty, { transform: [{ scale: scaleAnim }] }]} />;
}

function PinDots({ filled }: { filled: number }) {
	return (
		<View
			style={styles.dotsRow}
			accessible
			accessibilityRole="progressbar"
			accessibilityLabel="Passkey entry progress"
			accessibilityValue={{ min: 0, max: DOT_COUNT, now: filled }}
			accessibilityLiveRegion="polite"
			// The dots are decorative individually; expose progress as a single node.
			importantForAccessibility="yes"
		>
			{Array.from({ length: DOT_COUNT }).map((_, index) => (
				<PinDot key={index} filled={index < filled} />
			))}
		</View>
	);
}

function triggerErrorHaptic() {
	if (Platform.OS === "web") return;
	void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

function triggerSuccessHaptic() {
	if (Platform.OS === "web") return;
	void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Light tactile feedback on each keypress. If <PasskeyKey /> already fires its
// own haptic on press, delete these two calls to avoid a double-buzz.
function triggerSelectionHaptic() {
	if (Platform.OS === "web") return;
	void Haptics.selectionAsync();
}

export default function PasskeyPage() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { setHasPassword, setAuthenticated } = useAuthStore();
	const [mode, setMode] = useState<PasskeyMode>("verify");
	const [pin, setPin] = useState("");
	const [draftPin, setDraftPin] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isBusy, setIsBusy] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const shakeAnim = useRef(new Animated.Value(0)).current;
	const successScale = useRef(new Animated.Value(0)).current;
	const successOpacity = useRef(new Animated.Value(0)).current;
	const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		void hasPassword().then(exists => {
			setMode(exists ? "verify" : "create");
		});
	}, []);

	// Clear any pending navigation timer if the screen unmounts mid-animation.
	useEffect(() => {
		return () => {
			if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
		};
	}, []);

	// Announce errors so screen-reader users hear them (iOS doesn't auto-read
	// live regions the way Android does).
	useEffect(() => {
		if (error) AccessibilityInfo.announceForAccessibility(error);
	}, [error]);

	const instruction = mode === "create" ? "Create a 4-digit passkey" : mode === "confirm" ? "Re-enter your passkey to confirm" : "Enter your passkey";

	const triggerShake = useCallback(() => {
		shakeAnim.setValue(0);
		Animated.sequence([Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }), Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }), Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }), Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }), Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })]).start();
		triggerErrorHaptic();
	}, [shakeAnim]);

	const playSuccessAndNavigate = useCallback(
		(navigate: () => void) => {
			setShowSuccess(true);
			successScale.setValue(0.3);
			successOpacity.setValue(0);
			triggerSuccessHaptic();
			AccessibilityInfo.announceForAccessibility("Passkey verified");

			Animated.parallel([
				Animated.spring(successScale, {
					toValue: 1,
					useNativeDriver: true,
					friction: 5,
					tension: 120
				}),
				Animated.timing(successOpacity, {
					toValue: 1,
					duration: 180,
					useNativeDriver: true
				})
			]).start(() => {
				navTimeoutRef.current = setTimeout(navigate, 550);
			});
		},
		[successOpacity, successScale]
	);

	const handleComplete = useCallback(
		async (value: string) => {
			if (isBusy) return;
			setIsBusy(true);
			setError(null);

			try {
				if (mode === "create") {
					setDraftPin(value);
					setPin("");
					setMode("confirm");
					return;
				}

				if (mode === "confirm") {
					if (value !== draftPin) {
						setError("Passkeys do not match. Try again.");
						setDraftPin("");
						setMode("create");
						setPin("");
						triggerShake();
						return;
					}
					await setupPassword(value);
					setHasPassword(true);
					setAuthenticated(true);
					playSuccessAndNavigate(() => router.back());
					return;
				}

				const valid = await verifyPassword(value);
				if (valid) {
					setAuthenticated(true);
					playSuccessAndNavigate(() => router.back());
					return;
				}

				setError("Incorrect passkey. Try again.");
				setPin("");
				triggerShake();
			} catch {
				setError("Something went wrong. Try again.");
				setPin("");
				triggerShake();
			} finally {
				setIsBusy(false);
			}
		},
		[draftPin, isBusy, mode, playSuccessAndNavigate, router, setAuthenticated, setHasPassword, triggerShake]
	);

	const appendDigit = useCallback(
		(digit: string) => {
			if (isBusy || showSuccess || pin.length >= PASSKEY_LENGTH) return;
			triggerSelectionHaptic();
			const next = pin + digit;
			setPin(next);
			setError(null);
			if (next.length === PASSKEY_LENGTH) {
				void handleComplete(next);
			}
		},
		[handleComplete, isBusy, pin, showSuccess]
	);

	const removeDigit = useCallback(() => {
		if (isBusy || showSuccess || pin.length === 0) return;
		triggerSelectionHaptic();
		setPin(current => current.slice(0, -1));
		setError(null);
	}, [isBusy, showSuccess, pin.length]);

	return (
		<GlassScreen title="Passkey" onBack={() => router.back()}>
			<View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.base) }]}>
				<MotionView enter="fadeUp" duration={280}>
					<LiquidGlassCard size="large" style={styles.inputPanel}>
						<Animated.View style={[styles.inputPanelContent, { transform: [{ translateX: shakeAnim }] }]}>
							{showSuccess ? (
								<Animated.View style={[styles.successContainer, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
									<Icon name="checkmark-circle" family="ionicons" size={56} color={Colors.accent.teal} />
									<Text style={styles.successText}>Passkey verified</Text>
								</Animated.View>
							) : (
								<>
									<Text style={styles.instruction} accessibilityRole="header">
										{instruction}
									</Text>
									<PinDots filled={pin.length} />
									{/* Reserve space so the panel doesn't jump when an error appears. */}
									<View style={styles.errorSlot}>{error ? <Text style={styles.errorText}>{error}</Text> : null}</View>
								</>
							)}
						</Animated.View>
					</LiquidGlassCard>
				</MotionView>

				<MotionView enter="fadeUp" delay={80} duration={300} style={{ flex: 1 }}>
					<LiquidGlassCard size="large" style={styles.keypadPanel}>
						<View style={styles.keypadContent}>
							<View style={styles.keypadGrid}>
								{[
									["1", "2", "3"],
									["4", "5", "6"],
									["7", "8", "9"]
								].map((row, rowIndex) => (
									<MotionView key={row.join("-")} enter="fadeUp" delay={staggerMs(rowIndex, 45) + 100} style={styles.keypadRow}>
										{row.map(digit => (
											<PasskeyKey key={digit} label={digit} onPress={() => appendDigit(digit)} disabled={isBusy || showSuccess} />
										))}
									</MotionView>
								))}
								<MotionView enter="fadeUp" delay={staggerMs(3, 45) + 100} style={styles.keypadRow}>
									<View style={styles.keySlot} />
									<PasskeyKey label="0" onPress={() => appendDigit("0")} disabled={isBusy || showSuccess} />
									<PasskeyKey onPress={removeDigit} disabled={isBusy || showSuccess || pin.length === 0} accessibilityLabel="Delete last digit">
										<Icon name="backspace-outline" family="ionicons" size={22} color={Colors.text.primary} />
									</PasskeyKey>
								</MotionView>
							</View>
						</View>
					</LiquidGlassCard>
				</MotionView>
			</View>
		</GlassScreen>
	);
}

const DOT_SIZE = 12;
const DOT_GAP = 16;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: Spacing.screen,
		paddingTop: Spacing.sm,
		gap: 13
	},
	inputPanel: {
		width: "100%",
		minHeight: 140,
		borderRadius: BorderRadius.event,
		...Shadows.glass
	},
	inputPanelContent: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 28,
		paddingHorizontal: Spacing.lg,
		gap: 20,
		minHeight: 140
	},
	instruction: {
		fontSize: 14,
		color: "#99ADC2",
		textAlign: "center"
	},
	dotsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: DOT_GAP
	},
	dot: {
		width: DOT_SIZE,
		height: DOT_SIZE,
		borderRadius: DOT_SIZE / 2
	},
	dotFilled: {
		backgroundColor: Colors.accent.teal,
		borderWidth: 0
	},
	dotEmpty: {
		backgroundColor: "transparent",
		borderWidth: 1.5,
		borderColor: Colors.accent.teal
	},
	errorSlot: {
		minHeight: 18,
		alignItems: "center",
		justifyContent: "center"
	},
	errorText: {
		fontSize: 13,
		color: Colors.error,
		textAlign: "center"
	},
	successContainer: {
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm
	},
	successText: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.text.primary,
		textAlign: "center"
	},
	keypadPanel: {
		flex: 1,
		width: "100%",
		borderRadius: BorderRadius.event,
		marginBottom: Spacing.base,
		...Shadows.glass
	},
	keypadContent: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 24,
		paddingHorizontal: 40
	},
	keypadGrid: {
		alignItems: "center",
		justifyContent: "center",
		gap: PASSKEY_KEY_GAP
	},
	keypadRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: PASSKEY_KEY_GAP
	},
	keySlot: {
		width: PASSKEY_KEY_SIZE,
		height: PASSKEY_KEY_SIZE
	}
});
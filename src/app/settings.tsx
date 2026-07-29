import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GlassScreen } from "../components/ui/GlassScreen";
import { GlassToggle } from "../components/ui/GlassToggle";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { MotionView, staggerMs } from "../components/ui/MotionView";
import { useSettingsStore } from "../database/stores";
import { triggerSelectionHaptic } from "../design/haptics";
import { GlassColors, Spacing } from "../design/tokens";

const ROW_HEIGHT = 40;

interface SettingsToggleRowProps {
	label: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
	isLast?: boolean;
}

function SettingsToggleRow({ label, value, onValueChange, isLast }: SettingsToggleRowProps) {
	const handleChange = (next: boolean) => {
		void triggerSelectionHaptic();
		onValueChange(next);
	};

	return (
		<View style={[styles.row, !isLast && styles.rowBorder]}>
			<Text style={styles.rowLabel}>{label}</Text>
			<View style={styles.toggleCol}>
				<GlassToggle value={value} onValueChange={handleChange} />
			</View>
		</View>
	);
}

function SectionHeader({ title, delay, isFirst }: { title: string; delay: number; isFirst?: boolean }) {
	return (
		<MotionView enter="fade" delay={delay} duration={500}>
			<Text style={[styles.sectionHeader, isFirst && styles.sectionHeaderFirst]}>{title}</Text>
		</MotionView>
	);
}

function SectionDivider() {
	return <View style={styles.divider} />;
}

export default function Settings() {
	const router = useRouter();
	const enableNotifications = useSettingsStore(state => state.enableNotifications);
	const timezoneMode = useSettingsStore(state => state.timezoneMode);
	const pushNotifications = useSettingsStore(state => state.pushNotifications);
	const reminders = useSettingsStore(state => state.reminders);
	const autoAccept = useSettingsStore(state => state.autoAccept);
	const autoDecline = useSettingsStore(state => state.autoDecline);
	const updateSettings = useSettingsStore(state => state.updateSettings);
	const setTimezoneMode = useSettingsStore(state => state.setTimezoneMode);

	const handleTimezoneAutomatic = (value: boolean) => {
		if (value) setTimezoneMode("automatic");
	};

	const handleTimezoneManual = (value: boolean) => {
		if (value) setTimezoneMode("manual");
	};

	return (
		<GlassScreen title="Settings" onBack={() => router.back()}>
			<ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<MotionView enter="fadeUp" duration={280}>
					<LiquidGlassCard size="large" tint="field" noPadding style={styles.panel}>
						<View style={styles.panelInner}>
							<SectionHeader title="TIME ZONE" delay={staggerMs(0, 80)} isFirst />
							<SettingsToggleRow label="Set Automatically" value={timezoneMode === "automatic"} onValueChange={handleTimezoneAutomatic} />
							<SettingsToggleRow label="Set Manually" value={timezoneMode === "manual"} onValueChange={handleTimezoneManual} isLast />

							<SectionDivider />

							<SectionHeader title="NOTIFICATIONS" delay={staggerMs(1, 80)} />
							<SettingsToggleRow label="Allow Notifications" value={enableNotifications} onValueChange={value => updateSettings({ enableNotifications: value })} />
							<SettingsToggleRow label="Push Notifications" value={pushNotifications} onValueChange={value => updateSettings({ pushNotifications: value })} />
							<SettingsToggleRow label="Reminder (24h prior)" value={reminders} onValueChange={value => updateSettings({ reminders: value })} isLast />

							<SectionDivider />

							<SectionHeader title="INVITES" delay={staggerMs(2, 80)} />
							<SettingsToggleRow label="Auto-Accept Invites" value={autoAccept} onValueChange={value => updateSettings({ autoAccept: value })} />
							<SettingsToggleRow label="Auto-Decline Invites" value={autoDecline} onValueChange={value => updateSettings({ autoDecline: value })} isLast />

							<SectionDivider />

							<SectionHeader title="PRIVACY" delay={staggerMs(3, 80)} />
							<MotionView enter="fadeUp" delay={staggerMs(3, 80) + 40}>
								<Pressable onPress={() => router.push("/passkey_page")} style={styles.passkeyButton} accessibilityRole="button">
									<Text style={styles.passkeyText}>Configure Passkey</Text>
								</Pressable>
							</MotionView>
						</View>
					</LiquidGlassCard>
				</MotionView>

				<MotionView enter="fade" delay={320} duration={400}>
					<Text style={styles.footerCopy}>Secure unlock with Face ID or passkey</Text>
				</MotionView>
			</ScrollView>
		</GlassScreen>
	);
}

const styles = StyleSheet.create({
	scroll: {
		flex: 1,
		minHeight: 0
	},
	scrollContent: {
		paddingHorizontal: Spacing.screen,
		paddingBottom: Spacing["2xl"]
	},
	panel: {
		marginTop: Spacing.xs
	},
	panelInner: {
		paddingHorizontal: Spacing.base,
		paddingTop: Spacing.md,
		paddingBottom: Spacing.lg
	},
	sectionHeader: {
		fontSize: 12,
		fontWeight: "600",
		color: GlassColors.sectionHeader,
		letterSpacing: 1.2,
		marginBottom: Spacing.sm,
		marginTop: Spacing.md
	},
	sectionHeaderFirst: {
		marginTop: 0
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		height: ROW_HEIGHT
	},
	rowBorder: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: GlassColors.divider
	},
	rowLabel: {
		flex: 1,
		fontSize: 16,
		color: GlassColors.label,
		paddingRight: Spacing.md
	},
	toggleCol: {
		width: 51,
		height: ROW_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: GlassColors.divider,
		marginVertical: Spacing.base
	},
	passkeyButton: {
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
		width: "100%",
		maxWidth: 350,
		height: 52,
		borderRadius: 26,
		backgroundColor: "rgba(107, 219, 173, 0.12)",
		marginTop: Spacing.sm,
		marginBottom: Spacing.xs
	},
	passkeyText: {
		fontSize: 16,
		fontWeight: "600",
		color: GlassColors.accent,
		textAlign: "center"
	},
	footerCopy: {
		marginTop: Spacing.base,
		textAlign: "center",
		fontSize: 12,
		color: GlassColors.footer
	}
});

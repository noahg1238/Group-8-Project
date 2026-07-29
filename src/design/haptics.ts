import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useSettingsStore } from "../database/stores";

export async function triggerSuccessHaptic(): Promise<void> {
	if (Platform.OS === "web") return;
	if (!useSettingsStore.getState().enableHaptics) return;

	try {
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	} catch {
		// Haptics unavailable on this device
	}
}

export async function triggerSelectionHaptic(): Promise<void> {
	if (Platform.OS === "web") return;
	if (!useSettingsStore.getState().enableHaptics) return;

	try {
		await Haptics.selectionAsync();
	} catch {
		// Haptics unavailable on this device
	}
}

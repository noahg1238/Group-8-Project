import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassDateTimeSheet } from "../components/ui/GlassDateTimeSheet";
import { GlassPickerModal } from "../components/ui/GlassPickerModal";
import { GlassScreen } from "../components/ui/GlassScreen";
import { GlassToggle } from "../components/ui/GlassToggle";
import { Icon } from "../components/ui/Icon";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { MotionView, staggerMs } from "../components/ui/MotionView";
import { createEvent as createEventService, updateEvent as updateEventService, useEvent } from "../database/events";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "../design/haptics";
import { GlassColors, Spacing } from "../design/tokens";

type RepeatOption = "Never" | "Daily" | "Weekly" | "Monthly";
type TravelTimeOption = "None" | "15 min" | "30 min" | "1 hr";
type AlertOption = "None" | "At time" | "5 min before" | "15 min before" | "1 hr before";
type SheetTarget = "start" | "end" | null;
type PickerTarget = "repeat" | "travel" | "alert" | null;
const REPEAT_OPTIONS: RepeatOption[] = ["Never", "Daily", "Weekly", "Monthly"];
const TRAVEL_OPTIONS: TravelTimeOption[] = ["None", "15 min", "30 min", "1 hr"];
const ALERT_OPTIONS: AlertOption[] = ["None", "At time", "5 min before", "15 min before", "1 hr before"];
const ROW_HEIGHT = 44;
const STAGGER = 70;

function resolveParam(value: string | string[] | undefined): string | null {
	if (typeof value === "string" && value.length > 0) return value;
	if (Array.isArray(value) && value[0]?.length > 0) return value[0];
	return null;
}

function showMessage(title: string, message: string) {
	if (Platform.OS === "web") {
		window.alert(`${title}: ${message}`);
	} else {
		const { Alert } = require("react-native");
		Alert.alert(title, message);
	}
}

function setToMidnight(date: Date): Date {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

function setToDefaultTimes(date: Date): { start: Date; end: Date } {
	const start = new Date(date);
	start.setHours(9, 0, 0, 0);
	const end = new Date(start);
	end.setHours(10, 0, 0, 0);
	return { start, end };
}

function addHours(date: Date, hours: number): Date {
	const next = new Date(date);
	next.setHours(next.getHours() + hours);
	return next;
}

function formatEventDateTime(date: Date, allDay: boolean): string {
	if (allDay) {
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	}
	const pad = (n: number) => String(n).padStart(2, "0");
	const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	const timePart = date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true
	});
	return `${datePart} ${timePart}`;
}

interface ParameterRowProps {
	label: string;
	value?: string;
	showChevron?: boolean;
	rightAccessory?: React.ReactNode;
	isLast?: boolean;
	onPress?: () => void;
}

function ParameterRow({ label, value, showChevron, rightAccessory, isLast, onPress }: ParameterRowProps) {
	const content = (
		<View style={[styles.parameterRow, !isLast && styles.parameterRowBorder]}>
			<Text style={styles.parameterLabel}>{label}</Text>
			<View style={styles.parameterRight}>
				{value ? (
					<Text style={styles.parameterValue} numberOfLines={1}>
						{value}
					</Text>
				) : null}
				{rightAccessory}
				{showChevron ? <Icon name="chevron-forward" family="ionicons" size={14} color="rgba(255,255,255,0.35)" style={styles.chevron} /> : null}
			</View>
		</View>
	);

	if (onPress) {
		return (
			<Pressable onPress={onPress} accessibilityRole="button">
				{content}
			</Pressable>
		);
	}

	return content;
}

export default function AddEventPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ date?: string; id?: string | string[] }>();
	const editId = resolveParam(params.id);
	const { data: existingEvent, isLoading: isLoadingEvent } = useEvent(editId);
	const initialDate = params.date ? new Date(String(params.date)) : new Date();
	const [title, setTitle] = useState("");
	const [location, setLocation] = useState("");
	const [notes, setNotes] = useState("");
	const [allDay, setAllDay] = useState(true);
	const [startDate, setStartDate] = useState(() => setToMidnight(initialDate));
	const [endDate, setEndDate] = useState(() => setToMidnight(initialDate));
	const [repeat, setRepeat] = useState<RepeatOption>("Never");
	const [travelTime, setTravelTime] = useState<TravelTimeOption>("None");
	const [alert, setAlert] = useState<AlertOption>("None");
	const [isSaving, setIsSaving] = useState(false);
	const [dateSheet, setDateSheet] = useState<SheetTarget>(null);
	const [pickerSheet, setPickerSheet] = useState<PickerTarget>(null);
	const previousTimesRef = useRef<{ start: Date; end: Date } | null>(null);
	const focusProgress = useRef(new Animated.Value(0)).current;
	const hydratedRef = useRef<string | null>(null);

	React.useEffect(() => {
		hydratedRef.current = null;
	}, [editId]);

	React.useEffect(() => {
		if (!existingEvent || hydratedRef.current === existingEvent.id) return;
		hydratedRef.current = existingEvent.id;
		setTitle(existingEvent.title);
		setLocation(existingEvent.location ?? "");
		setNotes(existingEvent.notes ?? existingEvent.description ?? "");
		setAllDay(existingEvent.allDay);
		setStartDate(new Date(existingEvent.startDate));
		setEndDate(existingEvent.endDate ? new Date(existingEvent.endDate) : new Date(existingEvent.startDate));
	}, [existingEvent]);

	const formattedStart = useMemo(() => formatEventDateTime(startDate, allDay), [startDate, allDay]);
	const formattedEnd = useMemo(() => formatEventDateTime(endDate, allDay), [endDate, allDay]);

	const handleTitleFocus = () => {
		Animated.timing(focusProgress, { toValue: 1, duration: 220, useNativeDriver: false }).start();
	};

	const handleTitleBlur = () => {
		Animated.timing(focusProgress, { toValue: 0, duration: 220, useNativeDriver: false }).start();
	};

	const accentStyle = {
		opacity: 1,
		transform: [{ scaleY: focusProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
		shadowOpacity: focusProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] }),
		shadowRadius: focusProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })
	};

	const handleAllDayChange = useCallback(
		(value: boolean) => {
			void triggerSelectionHaptic();

			if (value) {
				previousTimesRef.current = { start: new Date(startDate), end: new Date(endDate) };
				setStartDate(setToMidnight(startDate));
				setEndDate(setToMidnight(endDate));
			} else if (previousTimesRef.current) {
				setStartDate(new Date(previousTimesRef.current.start));
				setEndDate(new Date(previousTimesRef.current.end));
			} else {
				const defaults = setToDefaultTimes(startDate);
				setStartDate(defaults.start);
				setEndDate(defaults.end);
			}

			setAllDay(value);
		},
		[startDate, endDate]
	);

	const handleStartConfirm = (date: Date) => {
		const nextStart = allDay ? setToMidnight(date) : date;
		setStartDate(nextStart);
		if (nextStart > endDate) {
			setEndDate(allDay ? setToMidnight(nextStart) : addHours(nextStart, 1));
		}
	};

	const handleEndConfirm = (date: Date) => {
		const nextEnd = allDay ? setToMidnight(date) : date;
		if (nextEnd < startDate) {
			setStartDate(allDay ? setToMidnight(nextEnd) : addHours(nextEnd, -1));
		}
		setEndDate(nextEnd);
	};

	const handleSave = async () => {
		let eventTitle = title.trim();

		if (Platform.OS === "web" && !eventTitle && typeof document !== "undefined") {
			const input = document.querySelector('input[placeholder="New Event"], textarea[placeholder="New Event"]') as HTMLInputElement | null;
			eventTitle = input?.value?.trim() ?? "";
		}

		if (!eventTitle) {
			showMessage("Missing title", "Please enter an event title.");
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				title: eventTitle,
				location: location.trim() || undefined,
				notes: notes.trim() || undefined,
				startDate,
				endDate,
				allDay
			};

			if (editId) {
				await updateEventService(editId, payload);
			} else {
				await createEventService(payload);
			}

			await queryClient.invalidateQueries({ queryKey: ["events"] });
			if (editId) {
				await queryClient.invalidateQueries({ queryKey: ["event", editId] });
			}
			await triggerSuccessHaptic();
			router.replace("/home");
		} catch (error) {
			console.error("[AddEvent] Save failed:", error);
			showMessage("Error", editId ? "Could not update event." : "Could not create event. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	if (editId && isLoadingEvent) {
		return (
			<GlassScreen title="Edit Event" onBack={() => router.back()}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={GlassColors.accent} />
				</View>
			</GlassScreen>
		);
	}

	return (
		<GlassScreen title={editId ? "Edit Event" : "Add Event"} onBack={() => router.back()}>
			<View style={styles.page}>
				<ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
					<MotionView enter="fadeDown" delay={staggerMs(0, STAGGER)} duration={420}>
						<LiquidGlassCard tint="field" noPadding style={styles.titleCard}>
							<View style={styles.titleCardContent}>
								<Animated.View style={[styles.titleAccent, accentStyle]} />
								<TextInput style={styles.titleInput} value={title} onChangeText={setTitle} onFocus={handleTitleFocus} onBlur={handleTitleBlur} {...(Platform.OS === "web" ? { onChange: (event: any) => setTitle(event.target.value) } : {})} placeholder="New Event" placeholderTextColor={GlassColors.placeholderStrong} autoFocus={!editId} />
							</View>
						</LiquidGlassCard>
					</MotionView>

					<MotionView enter="fadeDown" delay={staggerMs(1, STAGGER)} duration={420}>
						<LiquidGlassCard tint="field" noPadding style={styles.parametersCard}>
							<View style={styles.parametersContent}>
								<ParameterRow label="All Day" rightAccessory={<GlassToggle value={allDay} onValueChange={handleAllDayChange} />} isLast={false} />
								<ParameterRow label="Starts" value={formattedStart} showChevron isLast={false} onPress={() => setDateSheet("start")} />
								<ParameterRow label="Ends" value={formattedEnd} showChevron isLast={false} onPress={() => setDateSheet("end")} />
								<ParameterRow label="Repeat" value={repeat} showChevron isLast={false} onPress={() => setPickerSheet("repeat")} />
								<ParameterRow label="Travel Time" value={travelTime} showChevron isLast={false} onPress={() => setPickerSheet("travel")} />
								<ParameterRow label="Alert" value={alert} showChevron isLast onPress={() => setPickerSheet("alert")} />
							</View>
						</LiquidGlassCard>
					</MotionView>

					<MotionView enter="fadeDown" delay={staggerMs(2, STAGGER)} duration={420}>
						<LiquidGlassCard tint="field" noPadding style={styles.locationCard}>
							<View style={styles.singleFieldContent}>
								<TextInput style={styles.fieldInput} value={location} onChangeText={setLocation} {...(Platform.OS === "web" ? { onChange: (event: any) => setLocation(event.target.value) } : {})} placeholder="Location" placeholderTextColor={GlassColors.placeholder} />
							</View>
						</LiquidGlassCard>
					</MotionView>

					<MotionView enter="fadeDown" delay={staggerMs(3, STAGGER)} duration={420}>
						<LiquidGlassCard tint="field" noPadding style={styles.notesCard}>
							<View style={styles.notesContent}>
								<TextInput style={styles.notesInput} value={notes} onChangeText={setNotes} {...(Platform.OS === "web" ? { onChange: (event: any) => setNotes(event.target.value) } : {})} placeholder="Add Notes..." placeholderTextColor={GlassColors.placeholder} multiline textAlignVertical="top" />
							</View>
						</LiquidGlassCard>
					</MotionView>
				</ScrollView>

				<MotionView enter="fadeUp" delay={staggerMs(4, STAGGER)} duration={360} style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.base) }]}>
					<GlassButton onPress={() => void handleSave()} loading={isSaving} size="lg" style={styles.createButton}>
						{editId ? "Save Event" : "Create Event"}
					</GlassButton>
				</MotionView>
			</View>

			<GlassDateTimeSheet visible={dateSheet === "start"} onClose={() => setDateSheet(null)} title="Starts" value={startDate} allDay={allDay} onConfirm={handleStartConfirm} />
			<GlassDateTimeSheet visible={dateSheet === "end"} onClose={() => setDateSheet(null)} title="Ends" value={endDate} allDay={allDay} onConfirm={handleEndConfirm} />
			<GlassPickerModal visible={pickerSheet === "repeat"} onClose={() => setPickerSheet(null)} title="Repeat" options={REPEAT_OPTIONS.map(option => ({ label: option, value: option }))} selectedValue={repeat} onSelect={setRepeat} />
			<GlassPickerModal visible={pickerSheet === "travel"} onClose={() => setPickerSheet(null)} title="Travel Time" options={TRAVEL_OPTIONS.map(option => ({ label: option, value: option }))} selectedValue={travelTime} onSelect={setTravelTime} />
			<GlassPickerModal visible={pickerSheet === "alert"} onClose={() => setPickerSheet(null)} title="Alert" options={ALERT_OPTIONS.map(option => ({ label: option, value: option }))} selectedValue={alert} onSelect={setAlert} />
		</GlassScreen>
	);
}

const webInputReset =
	Platform.OS === "web"
		? ({
				outlineStyle: "none",
				boxSizing: "border-box"
			} as object)
		: {};

const styles = StyleSheet.create({
	page: {
		flex: 1,
		minHeight: 0
	},
	loadingContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},
	scroll: {
		flex: 1,
		minHeight: 0
	},
	scrollContent: {
		paddingHorizontal: Spacing.screen,
		paddingTop: Spacing.xs,
		paddingBottom: Spacing.base,
		gap: 20
	},
	footer: {
		paddingHorizontal: Spacing.screen,
		paddingTop: Spacing.sm
	},
	titleCard: {
		height: 56
	},
	titleCardContent: {
		height: 56,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16
	},
	titleAccent: {
		width: 4,
		height: 28,
		borderRadius: 2,
		backgroundColor: GlassColors.accent,
		marginRight: 12,
		flexShrink: 0,
		shadowColor: GlassColors.accent,
		shadowOffset: { width: 0, height: 0 }
	},
	titleInput: {
		flex: 1,
		minWidth: 0,
		height: 28,
		fontSize: 20,
		fontWeight: "600",
		color: GlassColors.label,
		padding: 0,
		margin: 0,
		textAlignVertical: "center",
		...(Platform.OS === "web" ? ({ lineHeight: 28 } as object) : {}),
		...webInputReset
	},
	parametersCard: {
		overflow: "hidden"
	},
	parametersContent: {
		paddingHorizontal: 16,
		paddingTop: 11,
		paddingBottom: 11
	},
	parameterRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		height: ROW_HEIGHT
	},
	parameterRowBorder: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: GlassColors.divider
	},
	parameterLabel: {
		fontSize: 16,
		color: GlassColors.label,
		flexShrink: 0
	},
	parameterRight: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: 4,
		marginLeft: Spacing.sm,
		minWidth: 0
	},
	parameterValue: {
		flexShrink: 1,
		fontSize: 15,
		color: GlassColors.value,
		textAlign: "right"
	},
	chevron: {
		flexShrink: 0,
		marginLeft: 2
	},
	locationCard: {
		height: 59
	},
	singleFieldContent: {
		height: 59,
		justifyContent: "center",
		paddingHorizontal: 16
	},
	fieldInput: {
		width: "100%",
		fontSize: 16,
		color: GlassColors.label,
		padding: 0,
		margin: 0,
		textAlignVertical: "center",
		...(Platform.OS === "web" ? ({ lineHeight: 20, height: 20 } as object) : {}),
		...webInputReset
	},
	notesCard: {
		minHeight: 200
	},
	notesContent: {
		paddingHorizontal: 16,
		paddingVertical: 14,
		flex: 1
	},
	notesInput: {
		flex: 1,
		minHeight: 120,
		width: "100%",
		fontSize: 16,
		color: GlassColors.label,
		padding: 0,
		...webInputReset
	},
	createButton: {
		width: "100%"
	}
});

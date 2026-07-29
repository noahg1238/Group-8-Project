import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DimensionValue, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { triggerSelectionHaptic } from "../../design/haptics";
import { GlassColors, Spacing } from "../../design/tokens";
import { GlassBottomSheet } from "./GlassBottomSheet";

export interface GlassDateTimeSheetProps {
	visible: boolean;
	onClose: () => void;
	title: string;
	value: Date;
	onConfirm: (date: Date) => void;
	allDay?: boolean;
}

const ITEM_H = 40;
const VISIBLE = 5;
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate();
}

function clampDay(year: number, month: number, day: number) {
	return Math.min(day, daysInMonth(year, month));
}

function WheelColumn({ data, index, onChange, width }: { data: string[]; index: number; onChange: (i: number) => void; width: DimensionValue }) {
	const ref = useRef<ScrollView>(null);
	const settling = useRef(false);

	useEffect(() => {
		const id = requestAnimationFrame(() => {
			ref.current?.scrollTo({ y: index * ITEM_H, animated: false });
		});
		return () => cancelAnimationFrame(id);
	}, [index, data.length]);

	const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const i = Math.round(event.nativeEvent.contentOffset.y / ITEM_H);
		const next = Math.max(0, Math.min(data.length - 1, i));
		settling.current = true;
		ref.current?.scrollTo({ y: next * ITEM_H, animated: true });
		if (next !== index) {
			void triggerSelectionHaptic();
			onChange(next);
		}
		settling.current = false;
	};

	return (
		<View style={[styles.wheelCol, { width }]}>
			<ScrollView ref={ref} showsVerticalScrollIndicator={false} snapToInterval={ITEM_H} decelerationRate="fast" onMomentumScrollEnd={onMomentumEnd} contentContainerStyle={{ paddingVertical: PAD }}>
				{data.map((label, i) => (
					<View key={`${label}-${i}`} style={styles.wheelItem}>
						<Text style={[styles.wheelText, i === index && styles.wheelTextSelected]}>{label}</Text>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

export function GlassDateTimeSheet({ visible, onClose, title, value, onConfirm, allDay = false }: GlassDateTimeSheetProps) {
	const [year, setYear] = useState(value.getFullYear());
	const [month, setMonth] = useState(value.getMonth());
	const [day, setDay] = useState(value.getDate());
	const [hour12, setHour12] = useState(() => {
		const h = value.getHours() % 12;
		return h === 0 ? 12 : h;
	});
	const [minute, setMinute] = useState(value.getMinutes());
	const [isPm, setIsPm] = useState(value.getHours() >= 12);

	useEffect(() => {
		if (!visible) return;
		setYear(value.getFullYear());
		setMonth(value.getMonth());
		setDay(value.getDate());
		const h = value.getHours() % 12;
		setHour12(h === 0 ? 12 : h);
		setMinute(value.getMinutes());
		setIsPm(value.getHours() >= 12);
	}, [visible, value]);

	const years = useMemo(() => Array.from({ length: 21 }, (_, i) => String(new Date().getFullYear() - 5 + i)), []);
	const yearIndex = Math.max(0, years.indexOf(String(year)));
	const dayCount = daysInMonth(year, month);
	const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => String(i + 1)), [dayCount]);
	const dayIndex = Math.max(0, Math.min(dayCount - 1, day - 1));
	const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), []);
	const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), []);
	const ampm = ["AM", "PM"];

	useEffect(() => {
		if (day > dayCount) setDay(dayCount);
	}, [day, dayCount]);

	const handleConfirm = useCallback(() => {
		void triggerSelectionHaptic();
		const next = new Date(year, month, clampDay(year, month, day));
		if (allDay) {
			next.setHours(0, 0, 0, 0);
		} else {
			let h = hour12 % 12;
			if (isPm) h += 12;
			next.setHours(h, minute, 0, 0);
		}
		onConfirm(next);
		onClose();
	}, [year, month, day, hour12, minute, isPm, allDay, onConfirm, onClose]);

	return (
		<GlassBottomSheet visible={visible} onClose={onClose} title={title}>
			<View style={styles.body}>
				<View style={styles.wheels}>
					<View style={styles.selectionBand} pointerEvents="none" />
					<WheelColumn data={MONTHS} index={month} onChange={setMonth} width="28%" />
					<WheelColumn data={days} index={dayIndex} onChange={i => setDay(i + 1)} width="18%" />
					<WheelColumn
						data={years}
						index={yearIndex >= 0 ? yearIndex : 5}
						onChange={i => setYear(Number(years[i]))}
						width={allDay ? "34%" : "22%"}
					/>
					{!allDay ? (
						<>
							<WheelColumn data={hours} index={hour12 - 1} onChange={i => setHour12(i + 1)} width="14%" />
							<WheelColumn data={minutes} index={minute} onChange={setMinute} width="14%" />
							<WheelColumn data={ampm} index={isPm ? 1 : 0} onChange={i => setIsPm(i === 1)} width="14%" />
						</>
					) : null}
				</View>

				<Pressable onPress={handleConfirm} style={styles.confirmButton} accessibilityRole="button">
					<Text style={styles.confirmText}>Done</Text>
				</Pressable>
			</View>
		</GlassBottomSheet>
	);
}

const styles = StyleSheet.create({
	body: {
		gap: Spacing.base,
		paddingTop: Spacing.xs,
		paddingBottom: Spacing.xs
	},
	wheels: {
		height: ITEM_H * VISIBLE,
		flexDirection: "row",
		alignItems: "stretch",
		justifyContent: "center",
		overflow: "hidden",
		position: "relative"
	},
	selectionBand: {
		position: "absolute",
		left: 0,
		right: 0,
		top: PAD,
		height: ITEM_H,
		borderRadius: 10,
		backgroundColor: "rgba(102, 178, 255, 0.12)",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "rgba(102, 178, 255, 0.35)",
		zIndex: 1
	},
	wheelCol: {
		height: ITEM_H * VISIBLE
	},
	wheelItem: {
		height: ITEM_H,
		alignItems: "center",
		justifyContent: "center"
	},
	wheelText: {
		fontSize: 17,
		color: "rgba(242, 245, 250, 0.35)",
		fontVariant: ["tabular-nums"]
	},
	wheelTextSelected: {
		color: GlassColors.value,
		fontWeight: "600",
		fontSize: 18
	},
	confirmButton: {
		alignSelf: "stretch",
		alignItems: "center",
		justifyContent: "center",
		minHeight: 44,
		borderRadius: 22,
		backgroundColor: GlassColors.accent
	},
	confirmText: {
		fontSize: 16,
		fontWeight: "600",
		color: GlassColors.accentText
	}
});

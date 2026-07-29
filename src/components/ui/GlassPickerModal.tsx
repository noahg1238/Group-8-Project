import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { triggerSelectionHaptic } from "../../design/haptics";
import { GlassColors, Spacing } from "../../design/tokens";
import { GlassBottomSheet } from "./GlassBottomSheet";
import { Icon } from "./Icon";

export interface GlassPickerOption<T extends string = string> {
	label: string;
	value: T;
}

export interface GlassPickerModalProps<T extends string = string> {
	visible: boolean;
	onClose: () => void;
	title: string;
	options: GlassPickerOption<T>[];
	selectedValue: T;
	onSelect: (value: T) => void;
}

export function GlassPickerModal<T extends string = string>({ visible, onClose, title, options, selectedValue, onSelect }: GlassPickerModalProps<T>) {
	const handleSelect = (value: T) => {
		void triggerSelectionHaptic();
		onSelect(value);
		onClose();
	};

	return (
		<GlassBottomSheet visible={visible} onClose={onClose} title={title}>
			<View style={styles.optionsList}>
				{options.map((option, index) => {
					const selected = option.value === selectedValue;
					return (
						<Pressable key={option.value} onPress={() => handleSelect(option.value)} style={[styles.optionRow, index < options.length - 1 && styles.optionRowBorder]} accessibilityRole="radio" accessibilityState={{ selected }}>
							<Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
							{selected ? <Icon name="checkmark" family="ionicons" size={20} color={GlassColors.accent} /> : null}
						</Pressable>
					);
				})}
			</View>
		</GlassBottomSheet>
	);
}

const styles = StyleSheet.create({
	optionsList: {
		paddingBottom: Spacing.xs
	},
	optionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 48,
		paddingHorizontal: 0
	},
	optionRowBorder: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: GlassColors.divider
	},
	optionLabel: {
		fontSize: 16,
		color: GlassColors.label
	},
	optionLabelSelected: {
		color: GlassColors.value,
		fontWeight: "600"
	}
});

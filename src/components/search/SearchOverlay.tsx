import { BlurView } from "expo-blur";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BorderRadius, Colors, Shadows, Spacing } from "../../design/tokens";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { Icon } from "../ui/Icon";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { MotionView, PrototypeMotion, staggerMs } from "../ui/MotionView";

export interface SearchSuggestion {
	id: string;
	title: string;
	highlight: string;
	subtitle: string;
	eventId?: string;
	eventDate?: string;
}

const DEFAULT_SUGGESTIONS: SearchSuggestion[] = [
	{ id: "1", title: "Executive team meeting", highlight: "Exec", subtitle: "Today · 6:30 AM" },
	{ id: "2", title: "Meetup with design", highlight: "Meet", subtitle: "Jun 12 · 2:00 PM" },
	{ id: "3", title: "Meeting notes sync", highlight: "Meet", subtitle: "Jun 13 · 9:00 AM" }
];

export interface SearchOverlayProps {
	visible: boolean;
	query: string;
	onQueryChange: (query: string) => void;
	onClose: () => void;
	suggestions?: SearchSuggestion[];
	onSuggestionPress?: (suggestion: SearchSuggestion) => void;
}

export { DEFAULT_SUGGESTIONS };

function getHighlightMatch(title: string, query: string): { before: string; match: string; after: string } {
	const trimmed = query.trim();
	if (!trimmed) return { before: title, match: "", after: "" };
	const matchIndex = title.toLowerCase().indexOf(trimmed.toLowerCase());
	if (matchIndex < 0) return { before: title, match: "", after: "" };
	return {
		before: title.slice(0, matchIndex),
		match: title.slice(matchIndex, matchIndex + trimmed.length),
		after: title.slice(matchIndex + trimmed.length)
	};
}

function SuggestionRow({ suggestion, query, onPress, isLast, index }: { suggestion: SearchSuggestion; query: string; onPress: () => void; isLast?: boolean; index: number }) {
	const { before, match, after } = getHighlightMatch(suggestion.title, query);

	return (
		<MotionView enter="fadeUp" delay={staggerMs(index, 30)} duration={150}>
			<AnimatedPressable onPress={onPress} style={styles.suggestionRow} haptic="selection" accessibilityRole="button">
				<View style={styles.suggestionAccent} />
				<View style={styles.suggestionContent}>
					<View style={styles.suggestionTitleRow}>
						{match ? (
							<>
								{before ? (
									<Text style={styles.suggestionTitle} numberOfLines={1}>
										{before}
									</Text>
								) : null}
								<Text style={styles.suggestionHighlight} numberOfLines={1}>
									{match}
								</Text>
								{after ? (
									<Text style={styles.suggestionTitleMedium} numberOfLines={1}>
										{after}
									</Text>
								) : null}
							</>
						) : (
							<Text style={styles.suggestionTitleMedium} numberOfLines={1}>
								{suggestion.title}
							</Text>
						)}
					</View>
					<Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
				</View>
				<Icon name="chevron-forward" family="ionicons" size={14} color={Colors.icon.muted} />
				{!isLast ? <View style={styles.suggestionDivider} /> : null}
			</AnimatedPressable>
		</MotionView>
	);
}

export function SearchOverlay({ visible, query, onQueryChange, onClose, suggestions = DEFAULT_SUGGESTIONS, onSuggestionPress }: SearchOverlayProps) {
	const insets = useSafeAreaInsets();
	const [modalVisible, setModalVisible] = useState(visible);
	const [isClosing, setIsClosing] = useState(false);
	const exitOpacity = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		if (visible) {
			setModalVisible(true);
			setIsClosing(false);
			exitOpacity.setValue(1);
		}
	}, [visible, exitOpacity]);

	const filteredSuggestions = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return suggestions;
		return suggestions.filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(trimmed));
	}, [query, suggestions]);

	const finishClose = useCallback(() => {
		setModalVisible(false);
		setIsClosing(false);
		onClose();
	}, [onClose]);

	const requestClose = useCallback(() => {
		if (isClosing) return;
		setIsClosing(true);
		Animated.timing(exitOpacity, { toValue: 0, duration: PrototypeMotion.dissolveMs, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
			if (finished) finishClose();
		});
	}, [exitOpacity, finishClose, isClosing]);

	const handleSuggestionPress = useCallback(
		(suggestion: SearchSuggestion) => {
			onSuggestionPress?.(suggestion);
			requestClose();
		},
		[onSuggestionPress, requestClose]
	);

	if (!modalVisible) return null;

	return (
		<Modal visible={modalVisible} transparent animationType="none" onRequestClose={requestClose} statusBarTranslucent>
			<Pressable style={styles.root} onPress={requestClose} accessibilityRole="none">
				<Animated.View style={[StyleSheet.absoluteFill, { opacity: exitOpacity }]}>
					<MotionView enter="fade" duration={PrototypeMotion.dissolveMs} style={StyleSheet.absoluteFill} pointerEvents="box-none">
						{Platform.OS === "ios" ? <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /> : null}
						<View style={styles.backdrop} />
					</MotionView>
				</Animated.View>

				<Animated.View style={[styles.overlayContent, { paddingTop: insets.top + Spacing.sm, opacity: exitOpacity }]} onTouchStart={(event: any) => event.stopPropagation?.()}>
					<MotionView enter="fadeUp" duration={PrototypeMotion.dissolveMs} style={styles.searchBarRow}>
						<LiquidGlassCard size="medium" style={styles.searchBar} noPadding>
							<View style={styles.searchBarInner}>
								<Icon name="search" family="feather" size={18} color={Colors.icon.muted} />
								<TextInput value={query} onChangeText={onQueryChange} placeholder="Search events" placeholderTextColor={Colors.text.placeholder} style={[styles.searchInput, Platform.OS === "web" && styles.searchInputWeb]} autoFocus returnKeyType="search" selectionColor={Colors.accent.teal} />
							</View>
						</LiquidGlassCard>

						<AnimatedPressable onPress={requestClose} accessibilityRole="button" accessibilityLabel="Close search" style={styles.closeButton} haptic="light">
							<LiquidGlassCard size="small" style={styles.closeButtonGlass}>
								<Icon name="close" family="ionicons" size={20} color={Colors.text.primary} />
							</LiquidGlassCard>
						</AnimatedPressable>
					</MotionView>

					<MotionView enter="fade" duration={PrototypeMotion.dissolveMs} delay={40}>
						<LiquidGlassCard size="large" style={styles.suggestionsPanel} noPadding>
							<View style={styles.suggestionsInner}>
								<Text style={styles.suggestionsLabel}>SUGGESTIONS</Text>
								<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.suggestionsList}>
									{filteredSuggestions.length > 0 ? (
										filteredSuggestions.map((suggestion, index) => <SuggestionRow key={suggestion.id} suggestion={suggestion} query={query} index={index} isLast={index === filteredSuggestions.length - 1} onPress={() => handleSuggestionPress(suggestion)} />)
									) : (
										<MotionView enter="fade" duration={200} style={styles.emptyState}>
											<Text style={styles.emptyStateText}>No matching events</Text>
										</MotionView>
									)}
								</ScrollView>
							</View>
						</LiquidGlassCard>
					</MotionView>
				</Animated.View>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(20, 26, 36, 0.72)",
		...(Platform.OS === "web"
			? ({
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)"
				} as object)
			: {})
	},
	overlayContent: {
		flex: 1,
		paddingHorizontal: 11,
		gap: 10
	},
	searchBarRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm
	},
	searchBar: {
		flex: 1,
		minHeight: 44,
		borderRadius: BorderRadius.full
	},
	searchBarInner: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		paddingHorizontal: Spacing.base,
		minHeight: 44
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: Colors.text.primary,
		paddingVertical: Platform.OS === "ios" ? 10 : 8
	},
	searchInputWeb: {
		outlineWidth: 0
	} as const,
	closeButton: {
		width: 44,
		height: 44
	},
	closeButtonGlass: {
		width: 44,
		height: 44
	},
	suggestionsPanel: {
		borderRadius: BorderRadius.event,
		borderWidth: 1,
		borderColor: "rgba(140, 178, 217, 0.35)",
		backgroundColor: "rgba(20, 26, 36, 0.94)",
		maxHeight: 208,
		overflow: "hidden",
		...Shadows.xl,
		...(Platform.OS === "web"
			? ({
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)"
				} as object)
			: {})
	},
	suggestionsInner: {
		paddingTop: 11,
		paddingBottom: 4
	},
	suggestionsLabel: {
		fontSize: 11,
		fontWeight: "600",
		letterSpacing: 1.1,
		color: "#8CBFFA",
		paddingHorizontal: 17,
		marginBottom: 8,
		textTransform: "uppercase"
	},
	suggestionsList: {
		maxHeight: 168
	},
	suggestionRow: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 56,
		paddingHorizontal: 16,
		position: "relative"
	},
	suggestionAccent: {
		width: 3,
		height: 28,
		borderRadius: 2,
		backgroundColor: "#6BDBAD",
		marginRight: 9
	},
	suggestionContent: {
		flex: 1,
		paddingRight: 8
	},
	suggestionTitleRow: {
		flexDirection: "row",
		flexWrap: "nowrap",
		alignItems: "center",
		overflow: "hidden"
	},
	suggestionTitle: {
		fontSize: 15,
		color: "#F2F5FA",
		flexShrink: 1
	},
	suggestionTitleMedium: {
		fontSize: 15,
		fontWeight: "500",
		color: "#F2F5FA",
		flexShrink: 1
	},
	suggestionHighlight: {
		fontSize: 15,
		color: "#6BDBAD",
		fontWeight: "600",
		flexShrink: 0
	},
	suggestionSubtitle: {
		marginTop: 4,
		fontSize: 12,
		color: "#8C99A8"
	},
	suggestionDivider: {
		position: "absolute",
		left: 16,
		right: 16,
		bottom: 0,
		height: StyleSheet.hairlineWidth,
		backgroundColor: "rgba(255, 255, 255, 0.08)"
	},
	emptyState: {
		paddingHorizontal: Spacing.base,
		paddingVertical: Spacing.xl
	},
	emptyStateText: {
		fontSize: 14,
		color: Colors.text.tertiary
	}
});

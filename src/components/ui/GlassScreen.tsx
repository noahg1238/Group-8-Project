import React, { createContext, useContext } from "react";
import { Animated, Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { Colors, GlassControl, Spacing } from "../../design/tokens";
import { AmbientBackground } from "./AmbientBackground";
import { AnimatedPressable } from "./AnimatedPressable";
import { Icon } from "./Icon";
import { LiquidGlassCard } from "./LiquidGlassCard";
import { useIosPushTransition } from "./WebRouteTransition";

const PushBackContext = createContext<(() => void) | null>(null);

export function usePushBack(fallback?: () => void) {
	const ctx = useContext(PushBackContext);
	return ctx ?? fallback;
}

export interface GlassScreenProps {
	children: React.ReactNode;
	title?: string;
	onBack?: () => void;
	hideHeader?: boolean;
	edges?: Edge[];
	className?: string;
	style?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
}

export function GlassScreen({ children, title, onBack, hideHeader = false, edges = ["top", "bottom"], className, style, contentStyle }: GlassScreenProps) {
	const { animatedBack, style: transitionStyle } = useIosPushTransition(onBack);
	const showHeader = !hideHeader && !!(title || onBack);
	const backHandler = onBack ? animatedBack : undefined;

	return (
		<SafeAreaView edges={edges} className={className} style={[styles.screen, style]}>
			<PushBackContext.Provider value={backHandler}>
				<Animated.View style={transitionStyle}>
					<AmbientBackground />
					{showHeader ? (
						<View style={styles.header}>
							<View style={styles.headerSide}>
								{backHandler ? (
									<AnimatedPressable onPress={backHandler} style={styles.backHit} haptic="light" accessibilityRole="button" accessibilityLabel="Go back">
										<LiquidGlassCard size="small" tint="toolbar" style={styles.backGlass}>
											<View style={styles.backGlassInner}>
												<Icon name="chevron-left" family="feather" size={22} color={Colors.text.primary} />
											</View>
										</LiquidGlassCard>
									</AnimatedPressable>
								) : null}
							</View>
							<View style={styles.headerTitleWrap}>
								{title ? (
									<Text style={styles.headerTitle} numberOfLines={1}>
										{title}
									</Text>
								) : null}
							</View>
							<View style={styles.headerSide} />
						</View>
					) : null}
					<View style={[styles.content, contentStyle]}>{children}</View>
				</Animated.View>
			</PushBackContext.Provider>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.screen,
		overflow: Platform.OS === "web" ? "hidden" : undefined
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: Spacing.topBar,
		paddingVertical: Spacing.sm,
		minHeight: GlassControl.size + Spacing.sm * 2
	},
	headerSide: {
		width: GlassControl.size,
		zIndex: 1
	},
	headerTitleWrap: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.sm
	},
	backHit: {
		borderRadius: GlassControl.size / 2
	},
	backGlass: {
		width: GlassControl.size,
		height: GlassControl.size
	},
	backGlassInner: {
		width: GlassControl.size,
		height: GlassControl.size,
		alignItems: "center",
		justifyContent: "center"
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "600",
		color: Colors.text.primary,
		textAlign: "center"
	},
	content: {
		flex: 1
	}
});

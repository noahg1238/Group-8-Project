import { Platform } from "react-native";
import { PrototypeMotion } from "../components/ui/MotionView";

/** Matches Figma PlanB prototype: PUSH LEFT forward / PUSH RIGHT on pop */
const pushAnimation = Platform.select({
	ios: "simple_push" as const,
	android: "slide_from_right" as const,
	default: "slide_from_right" as const
});

const smartAnimate = Platform.select({
	ios: "fade" as const,
	android: "fade" as const,
	default: "fade" as const
});

export const stackScreenOptions = {
	headerShown: false,
	contentStyle: { backgroundColor: "#242736" },
	presentation: "card" as const,
	animation: pushAnimation,
	animationDuration: PrototypeMotion.pushMs,
	gestureDirection: "horizontal" as const
};

export const stackScreens = {
	index: {},
	home: {},
	year_overview: {
		animation: smartAnimate,
		animationDuration: PrototypeMotion.smartAnimateMs
	},
	settings: {
		animation: pushAnimation,
		animationDuration: PrototypeMotion.pushMs
	},
	add_event_page: {
		animation: pushAnimation,
		animationDuration: PrototypeMotion.pushMs
	},
	event_details: {
		animation: pushAnimation,
		animationDuration: PrototypeMotion.pushMs
	},
	passkey_page: {
		animation: pushAnimation,
		animationDuration: PrototypeMotion.pushMs
	}
} as const;

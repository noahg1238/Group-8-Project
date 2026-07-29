// Shared Reanimated motion presets for glass UI, calendar, and events
import { Easing, FadeIn, FadeInDown, FadeInUp, FadeOut, SlideInDown, SlideInLeft, SlideInRight, SlideInUp, SlideOutLeft, SlideOutRight, withDelay, withRepeat, withSequence, withSpring, withTiming, type SharedValue, type WithSpringConfig } from "react-native-reanimated";
import { Animation } from "./tokens";

const spring = Animation.spring.default;

export const springConfig: WithSpringConfig = {
	damping: spring.damping,
	stiffness: spring.stiffness,
	mass: spring.mass
};

export const springPress: WithSpringConfig = {
	damping: 18,
	stiffness: 280,
	mass: 0.8
}; // Snappy spring for press interactions (scale 0.97)

export const springReveal: WithSpringConfig = {
	damping: 22,
	stiffness: 180,
	mass: 1
}; // Gentle spring for layout / reveal

export const PRESS_SCALE = 0.97; // Standard press scale target

export const springDaySelect: WithSpringConfig = {
	damping: 16,
	stiffness: 220,
	mass: 0.7
}; // Calendar day selection ring

export const springUnderline: WithSpringConfig = {
	damping: 14,
	stiffness: 180,
	mass: 0.6
}; // Event underline grow

export const springChevron: WithSpringConfig = {
	damping: 20,
	stiffness: 320,
	mass: 0.5
}; // Month chevron nudge

export const MotionPresets = {
	cardEnter: SlideInUp.springify().damping(spring.damping).stiffness(spring.stiffness).mass(spring.mass),
	fadeIn: FadeIn.duration(Animation.duration.normal),
	fadeInUp: (delay = 0) => FadeInUp.delay(delay).duration(Animation.duration.normal).springify().damping(spring.damping).stiffness(spring.stiffness),
	staggerSection: (index: number, baseDelay = 180) =>
		FadeInDown.delay(baseDelay + index * 80)
			.duration(Animation.duration.normal)
			.springify()
			.damping(spring.damping)
			.stiffness(spring.stiffness),
	calendarEnter: FadeInDown.delay(60).duration(Animation.duration.slow).springify().damping(spring.damping).stiffness(spring.stiffness)
};

export function animatePressScale(scale: SharedValue<number>, pressed: boolean, target = PRESS_SCALE): void {
	scale.value = withSpring(pressed ? target : 1, springPress); // Animate a shared scale value for press state
}

export const fadeInUp = FadeInUp.duration(Animation.duration.normal).springify().damping(20).stiffness(180); // Fade + slide up entrance

export function staggerDelay(index: number, baseMs = 50): number {
	return index * baseMs; // Stagger delay helper for list / grid entrances (ms)
}

export const scaleIn = FadeIn.duration(Animation.duration.normal).springify().damping(18).stiffness(220); // Scale-in entrance from 0.92 → 1
export const modalSlideUp = SlideInDown.duration(Animation.duration.slow).springify().damping(24).stiffness(200); // Modal / sheet slide up from bottom
export const blurReveal = FadeInUp.duration(Animation.duration.slow).delay(Animation.duration.fast).easing(Easing.out(Easing.cubic)); // Blur reveal — opacity fade with slight upward drift

export function glassShimmer(durationMs = 2800) {
	"worklet"; // Subtle glass shimmer loop
	return withRepeat(withSequence(withTiming(1, { duration: durationMs * 0.45, easing: Easing.inOut(Easing.ease) }), withTiming(0.4, { duration: durationMs * 0.55, easing: Easing.inOut(Easing.ease) })), -1, true);
}

export function startGlassShimmer(opacity: SharedValue<number>, durationMs = 2800): void {
	opacity.value = 0.4; // Run glass shimmer on a shared opacity value
	opacity.value = glassShimmer(durationMs);
}

export function startBorderPulse(opacity: SharedValue<number>, durationMs = 2200): void {
	opacity.value = withRepeat(withSequence(withTiming(1, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.ease) }), withTiming(0.35, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.ease) })), -1, true); // Pulsing border for add-event CTA
}

export function withStaggerDelay(index: number, animation: number, baseMs = 50): number {
	return withDelay(staggerDelay(index, baseMs), animation); // Delay wrapper for staggered children
}

export function monthGridEnter(direction: "prev" | "next") {
	return (direction === "next" ? SlideInRight : SlideInLeft).duration(Animation.duration.fast).springify().damping(26).stiffness(240); // Month grid slide transitions
}

export function monthGridExit(direction: "prev" | "next") {
	return (direction === "next" ? SlideOutLeft : SlideOutRight).duration(Animation.duration.fast).springify().damping(28).stiffness(260);
}

export function eventCardEnter(index = 0) {
	return FadeInUp.delay(staggerDelay(index, 40)).duration(Animation.duration.fast).springify().damping(22).stiffness(220); // Event list card entrance / exit
}

export function eventCardExit() {
	return FadeOut.duration(Animation.duration.fast).easing(Easing.in(Easing.cubic));
}

export const searchBackdropEnter = FadeIn.duration(Animation.duration.normal).easing(Easing.out(Easing.cubic)); // Search overlay animations
export const searchBackdropExit = FadeOut.duration(Animation.duration.fast).easing(Easing.in(Easing.cubic));
export const searchBarEnter = FadeInUp.duration(Animation.duration.normal).springify().damping(22).stiffness(200);
export const searchBarExit = FadeOut.duration(Animation.duration.fast).easing(Easing.in(Easing.cubic));

export function searchSuggestionEnter(index = 0) {
	return FadeInUp.delay(staggerDelay(index, 30)).duration(Animation.duration.fast).springify().damping(24).stiffness(220);
}

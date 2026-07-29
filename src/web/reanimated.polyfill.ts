import React from "react";
import { Text, View } from "react-native";

// React Native Reanimated doesn't work on web - this is a no-op polyfill
function createChainingStub() {
	const stub: any = () => stub;
	stub.springify = stub;
	stub.damping = stub;
	stub.stiffness = stub;
	stub.mass = stub;
	stub.duration = stub;
	stub.delay = stub;
	stub.easing = stub;
	return stub;
}

const REANIMATED_PROPS = new Set([
	"entering",
	"exiting",
	"layout",
	"sharedTransitionTag",
	"sharedTransitionStyle"
]);

function omitReanimatedProps(props: any) {
	if (!props) return props;
	const next: any = {};
	for (const key in props) {
		if (!REANIMATED_PROPS.has(key)) {
			next[key] = props[key];
		}
	}
	return next;
}

const AnimatedView = React.forwardRef<View, any>(function AnimatedViewPolyfill(props, ref) {
	return React.createElement(View, { ...omitReanimatedProps(props), ref } as any);
});

const AnimatedText = React.forwardRef<any, any>(function AnimatedTextPolyfill(props, ref) {
	return React.createElement(Text, { ...omitReanimatedProps(props), ref } as any);
});

const defaultAnimated = {
	Value: class {
		constructor(value: number | string = 0) {
			return { value };
		}
	},
	View: AnimatedView,
	Text: AnimatedText,
	createAnimatedComponent: (component: any) => {
		return React.forwardRef<any, any>(function AnimatedComponentPolyfill(props, ref) {
			return React.createElement(component, { ...omitReanimatedProps(props), ref } as any);
		});
	}
};

export default defaultAnimated;
export const Animated = defaultAnimated;

// Layout animation stubs
export const FadeIn = createChainingStub();
export const FadeInUp = createChainingStub();
export const FadeInDown = createChainingStub();
export const FadeOut = createChainingStub();
export const ZoomIn = createChainingStub();
export const ZoomOut = createChainingStub();
export const SlideInUp = createChainingStub();
export const SlideInDown = createChainingStub();
export const SlideInLeft = createChainingStub();
export const SlideInRight = createChainingStub();
export const SlideOutLeft = createChainingStub();
export const SlideOutRight = createChainingStub();
export const Easing = {
	out: () => () => 0,
	in: () => () => 0,
	inOut: () => () => 0,
	cubic: () => 0,
	ease: () => 0,
	linear: () => 0,
	poly: () => 0,
	sin: () => 0,
	circle: () => 0,
	exp: () => 0,
	elastic: () => 0,
	back: () => 0,
	bounce: () => 0,
	bezier: () => 0,
	bezierFn: () => 0
};

// Stub out all hook exports
export function useSharedValue<T>(value: T) {
	return { value };
}

export function useAnimatedStyle(style: any) {
	return typeof style === "function" ? style() : style;
}

export function useDerivedValue<T>(value: T) {
	return { value };
}

export function useAnimatedGestureHandler() {
	return {};
}

export function useAnimatedScrollHandler() {
	return {};
}

export function useAnimatedReaction() {}

export function useWorkletCallback(fn: Function) {
	return fn;
}

function finishAnimation(callback?: (finished?: boolean) => void) {
	if (typeof callback === "function") {
		queueMicrotask(() => callback(true));
	}
}

export function withSpring(toValue?: any, _config?: any, callback?: (finished?: boolean) => void) {
	finishAnimation(callback);
	return toValue;
}
export function withTiming(toValue?: any, _config?: any, callback?: (finished?: boolean) => void) {
	finishAnimation(callback);
	return toValue;
}
export function withDecay(config?: any, callback?: (finished?: boolean) => void) {
	finishAnimation(callback);
	return config?.velocity ?? 0;
}
export function withDelay(_: any, animation: any) {
	return animation;
}
export function withRepeat(animation: any, _numberOfReps?: number, _reverse?: boolean, callback?: (finished?: boolean) => void) {
	finishAnimation(callback);
	return animation;
}
export function withSequence(...animations: any[]) {
	return animations.length > 0 ? animations[animations.length - 1] : undefined;
}
export function cancelAnimation() {}
export function measure() {}
export function scrollTo() {}
export function interpolate(value: number, input: number[], output: number[]) {
	if (!input?.length || !output?.length) return 0;
	if (value <= input[0]) return output[0];
	if (value >= input[input.length - 1]) return output[output.length - 1];
	for (let i = 0; i < input.length - 1; i += 1) {
		if (value >= input[i] && value <= input[i + 1]) {
			const t = (value - input[i]) / (input[i + 1] - input[i] || 1);
			return output[i] + (output[i + 1] - output[i]) * t;
		}
	}
	return output[0];
}
export function interpolateColor() {
	return "";
}

export function runOnUI(fn: Function) {
	return fn;
}
export function runOnJS(fn: Function) {
	return fn;
}
export function makeMutable<T>(value: T) {
	return { value };
}
export function makeRemote<T>(value: T) {
	return { value };
}
export function makeShareable(value: any) {
	return value;
}

export type SharedValue<T = any> = { value: T };
export type WithSpringConfig = Record<string, any>;

// Default exports commonly used
export function useFrameCallback() {
	return { setActive: () => {} };
}
export function useAnimatedRef() {
	return { current: null };
}
export function useAnimatedProps() {
	return {};
}
export function useAnimatedSensor() {
	return null;
}
export function useReducedMotion() {
	return false;
}

import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { PRESS_SCALE, springPress } from "../../design/motion";

export type HapticStyle = "light" | "medium" | "heavy" | "selection" | "none";

export interface AnimatedCalendarPressableProps extends Omit<
  PressableProps,
  "style"
> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressScale?: number;
  haptic?: HapticStyle;
  disabled?: boolean;
}

async function triggerHaptic(style: HapticStyle): Promise<void> {
  switch (style) {
    case "light":
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case "medium":
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case "heavy":
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case "selection":
      await Haptics.selectionAsync();
      break;
    default:
      break;
  }
}

export function AnimatedCalendarPressable({
  children,
  style,
  pressScale = PRESS_SCALE,
  haptic = "light",
  disabled = false,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedCalendarPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      if (!disabled) {
        scale.value = withSpring(pressScale, springPress);
        if (haptic !== "none") {
          void triggerHaptic(haptic);
        }
      }
      onPressIn?.(event);
    },
    [disabled, haptic, onPressIn, pressScale, scale],
  );

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
      scale.value = withSpring(1, springPress);
      onPressOut?.(event);
    },
    [onPressOut, scale],
  );

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
      {...props}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

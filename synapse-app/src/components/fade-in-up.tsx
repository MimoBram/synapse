import { useEffect, type ReactNode } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

/**
 * Manual fade+rise-in, driven by useSharedValue/withTiming rather than
 * reanimated's `entering={FadeInUp}` shorthand — that shorthand leaves
 * elements stuck at `visibility: hidden` on react-native-web (an SSR/
 * hydration timing bug), so this reimplements the same effect reliably
 * across platforms.
 */
export function FadeInUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }));

  return (
    <Animated.View className={className} style={style}>
      {children}
    </Animated.View>
  );
}

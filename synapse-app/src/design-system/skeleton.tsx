import { useEffect } from "react";
import type { ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { cn } from "@/src/lib/utils";

/**
 * Pulsing placeholder. Callers must size this to match the real content
 * exactly (width/height/className) so loading states never shift layout —
 * see each *Skeleton component paired with its real counterpart.
 */
export function Skeleton({ className, style, ...props }: ViewProps & { className?: string }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View className={cn("rounded-md bg-muted", className)} style={[animatedStyle, style]} {...props} />;
}

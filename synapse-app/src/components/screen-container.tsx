import type { ReactNode } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { cn } from "@/src/lib/utils";

const WIDE_BREAKPOINT = 768;
const MAX_CONTENT_WIDTH = 1280;

/**
 * Full-width with a standard gutter on phones. On web (react-native-web) or
 * a tablet-width viewport, caps content at 1280px and centers it — that
 * cap is meaningless on a ~375-430dp phone, so it only kicks in where a
 * "container" concept actually applies.
 */
export function ScreenContainer({ children, className }: { children: ReactNode; className?: string }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" || width >= WIDE_BREAKPOINT;

  return (
    <View className={cn("flex-1 px-4", className)}>
      <View className={cn("w-full flex-1", isWide && "self-center")} style={isWide ? { maxWidth: MAX_CONTENT_WIDTH } : undefined}>
        {children}
      </View>
    </View>
  );
}

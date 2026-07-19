import { cva, type VariantProps } from "class-variance-authority";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { gradients, radius } from "@/src/design-system/tokens";
import { cn } from "@/src/lib/utils";
import { Text } from "@/src/design-system/text";

// h-11 (44px) meets the minimum touch target; hitSlop gives the compact
// "sm" variant (36px) the same effective tap area without growing visually.
const buttonVariants = cva("flex-row items-center justify-center gap-2 rounded-md overflow-hidden disabled:opacity-50", {
  variants: {
    variant: {
      default: "",
      secondary: "bg-secondary",
      outline: "border border-border bg-transparent",
      ghost: "bg-transparent",
      destructive: "bg-destructive",
    },
    size: {
      default: "h-11 px-4",
      sm: "h-9 px-3",
      lg: "h-12 px-6",
      icon: "h-11 w-11",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const buttonTextVariants = cva("text-body font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface ButtonProps extends Omit<PressableProps, "children">, VariantProps<typeof buttonVariants> {
  className?: string;
  textClassName?: string;
  children: ReactNode;
}

// NOTE: className must live on a plain <Pressable> — NativeWind's compiler
// only recognizes literal `<View>`/`<Pressable>`/etc. JSX from
// 'react-native', not components wrapped via Animated.createAnimatedComponent.
// The press-scale animation instead lives on a plain Animated.View wrapper
// that only ever receives a `style` prop, never `className`.
export function Button({
  className,
  textClassName,
  variant = "default",
  size,
  children,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const colorScheme = useColorScheme() ?? "light";
  const animatedStyle = useAnimatedStyle(() => ({
    alignSelf: "stretch",
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        className={cn(buttonVariants({ variant, size }), className)}
        onPressIn={(e) => {
          scale.value = withSpring(0.97, { damping: 16, stiffness: 400 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 16, stiffness: 400 });
          onPressOut?.(e);
        }}
        {...props}>
        {variant === "default" && (
          <LinearGradient
            colors={gradients.primary[colorScheme]}
            style={[StyleSheet.absoluteFillObject, { borderRadius: radius.md }]}
          />
        )}
        {typeof children === "string" ? (
          <Text className={cn(buttonTextVariants({ variant }), textClassName)}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}

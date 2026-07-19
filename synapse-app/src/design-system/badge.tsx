import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/src/lib/utils";
import { Text } from "@/src/design-system/text";

// Semantic variants map 1:1 to meaning (see design-language artifact):
// sprout = open_source, spark = hiring, ink = personal/generic skill chip.
const badgeVariants = cva("self-start rounded-full px-3 py-1", {
  variants: {
    variant: {
      default: "bg-primary",
      secondary: "bg-secondary",
      destructive: "bg-destructive",
      outline: "border border-border bg-transparent",
      sprout: "bg-sprout-tint",
      spark: "bg-spark-tint",
      ink: "bg-ink-tint",
    },
  },
  defaultVariants: { variant: "default" },
});

const badgeTextVariants = cva("text-caption font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      sprout: "text-sprout-tint-foreground",
      spark: "text-spark-tint-foreground",
      ink: "text-ink-tint-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  className?: string;
  children: ReactNode;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={badgeTextVariants({ variant })}>{children}</Text>
    </View>
  );
}

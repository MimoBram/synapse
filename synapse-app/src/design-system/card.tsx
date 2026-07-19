import type { ComponentProps } from "react";
import { View, type ViewProps } from "react-native";
import { cardShadow } from "@/src/design-system/tokens";
import { cn } from "@/src/lib/utils";
import { Text } from "@/src/design-system/text";

function Card({ className, style, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("rounded-card border border-border bg-card p-4", className)}
      style={[cardShadow, style]}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn("mb-3", className)} {...props} />;
}

function CardTitle({ className, ...props }: ComponentProps<typeof Text>) {
  return <Text variant="subheading" className={cn("text-card-foreground", className)} {...props} />;
}

function CardDescription({ className, ...props }: ComponentProps<typeof Text>) {
  return <Text variant="caption" className={className} {...props} />;
}

function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={className} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn("mt-3 flex-row items-center gap-2", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

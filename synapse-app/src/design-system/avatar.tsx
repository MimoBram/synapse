import { Image, View } from "react-native";
import { cn } from "@/src/lib/utils";
import { Text } from "@/src/design-system/text";

export interface AvatarProps {
  uri?: string | null;
  fallback: string;
  size?: number;
  className?: string;
}

export function Avatar({ uri, fallback, size = 40, className }: AvatarProps) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={dimensionStyle}
        className={cn("bg-muted", className)}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View style={dimensionStyle} className={cn("items-center justify-center bg-muted", className)}>
      <Text variant="caption" className="font-semibold text-muted-foreground">
        {fallback.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

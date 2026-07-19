import { cva, type VariantProps } from "class-variance-authority";
import { Text as RNText, type TextProps } from "react-native";
import { fonts } from "@/src/design-system/tokens";
import { cn } from "@/src/lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      display: "text-display",
      heading: "text-heading",
      subheading: "text-subheading",
      body: "text-body",
      caption: "text-caption text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TextComponentProps extends TextProps, VariantProps<typeof textVariants> {
  className?: string;
  /** Platform monospace face for metadata/labels (timestamps, skill tags, counts). */
  mono?: boolean;
}

export function Text({ className, variant, mono, style, ...props }: TextComponentProps) {
  return (
    <RNText
      className={cn(textVariants({ variant }), className)}
      style={[mono ? { fontFamily: fonts?.mono } : undefined, style]}
      {...props}
    />
  );
}

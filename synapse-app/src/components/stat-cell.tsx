import { Card } from "@/src/design-system/card";
import { Text } from "@/src/design-system/text";

export function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <Card className="flex-1 p-3">
      <Text variant="heading" style={{ fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text variant="caption" className="mt-0.5">
        {label}
      </Text>
    </Card>
  );
}

import { View } from "react-native";
import { Avatar } from "@/src/design-system/avatar";
import { Text } from "@/src/design-system/text";

export interface ActivityItemData {
  id: string;
  actorInitials: string;
  message: string;
  timeLabel: string;
}

export function ActivityRow({ item }: { item: ActivityItemData }) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <Avatar fallback={item.actorInitials} size={32} />
      <Text className="flex-1 text-[13px]">{item.message}</Text>
      <Text mono variant="caption">
        {item.timeLabel}
      </Text>
    </View>
  );
}

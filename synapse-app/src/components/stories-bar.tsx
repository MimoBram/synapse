import { ScrollView, View } from "react-native";
import { Avatar } from "@/src/design-system/avatar";
import { Text } from "@/src/design-system/text";
import { cn } from "@/src/lib/utils";

export interface CollaboratorShortcut {
  id: string;
  initials: string;
  name: string;
  /** Currently online — gets the spark-colored ring, mirroring "active now" from the reference designs. */
  active?: boolean;
}

/** Horizontal row of collaborator shortcuts — an active ring stands in for "story" rings from the reference screens. */
export function StoriesBar({ items }: { items: CollaboratorShortcut[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pr-4">
      {items.map((item) => (
        <View key={item.id} className="items-center gap-1.5" style={{ width: 60 }}>
          <View
            className={cn(
              "h-14 w-14 items-center justify-center rounded-full",
              item.active ? "border-2 border-spark" : "border border-border",
            )}>
            <Avatar fallback={item.initials} size={48} />
          </View>
          <Text variant="caption" numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

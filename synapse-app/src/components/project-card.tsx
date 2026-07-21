import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";
import { Avatar } from "@/src/design-system/avatar";
import { Badge } from "@/src/design-system/badge";
import { Button } from "@/src/design-system/button";
import { Card } from "@/src/design-system/card";
import { Text } from "@/src/design-system/text";
import { cardShadowLg } from "@/src/design-system/tokens";

export type ProjectType = "open_source" | "hiring" | "personal";

export interface ProjectSummary {
  id: string;
  title: string;
  projectType: ProjectType;
  skills: string[];
  updatedLabel: string;
  contributorCount: number;
  ownerName: string;
  ownerInitials: string;
  /** "Join" for discoverable projects, "View" once you're already a collaborator/owner. */
  actionLabel: "Join" | "View";
}

const projectTypeBadge: Record<ProjectType, "sprout" | "spark" | "ink"> = {
  open_source: "sprout",
  hiring: "spark",
  personal: "ink",
};

const projectTypeLabel: Record<ProjectType, string> = {
  open_source: "open source",
  hiring: "hiring",
  personal: "personal",
};

/** Full-width discovery feed card: cover, tags, owner row, pill action button. */
export function ProjectHeroCard({ project, onPress }: { project: ProjectSummary; onPress?: () => void }) {
  return (
    <View className="overflow-hidden rounded-card border border-border bg-card" style={cardShadowLg}>
      <LinearGradient colors={["#4338ca", "#7c6ff0", "#dd5b3e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 128 }}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={{ flex: 1, justifyContent: "flex-end", padding: 16 }}>
          <View className="flex-row flex-wrap gap-2">
            <Badge variant={projectTypeBadge[project.projectType]}>{projectTypeLabel[project.projectType]}</Badge>
            {project.skills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="ink">
                {skill}
              </Badge>
            ))}
          </View>
        </LinearGradient>
      </LinearGradient>

      <View className="p-4">
        <Text variant="subheading" className="mb-1">
          {project.title}
        </Text>
        <Text mono variant="caption" className="mb-4">
          {project.updatedLabel} · {project.contributorCount} kontributor
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Avatar fallback={project.ownerInitials} size={32} />
            <Text className="text-[13px] font-medium">{project.ownerName}</Text>
          </View>
          <Button size="sm" className="rounded-full px-5" onPress={onPress}>
            {project.actionLabel}
          </Button>
        </View>
      </View>
    </View>
  );
}

/** Compact card for the 2-column "Proyek saya" grid. */
export function ProjectCompactCard({ project, onPress }: { project: ProjectSummary; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1" accessibilityRole="button">
      <Card className="rounded-3xl p-3">
        <Badge variant={projectTypeBadge[project.projectType]} className="mb-2">
          {projectTypeLabel[project.projectType]}
        </Badge>
        <Text className="mb-0.5 text-[13px] font-semibold">{project.title}</Text>
        <Text mono variant="caption">{project.skills[0]}</Text>
      </Card>
    </Pressable>
  );
}

import { ScrollView, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityRow, type ActivityItemData } from '@/src/components/activity-row';
import { FadeInUp } from '@/src/components/fade-in-up';
import { ProjectCompactCard, ProjectHeroCard, type ProjectSummary } from '@/src/components/project-card';
import { ScreenContainer } from '@/src/components/screen-container';
import { StatCell } from '@/src/components/stat-cell';
import { Avatar } from '@/src/design-system/avatar';
import { Text } from '@/src/design-system/text';

// Static mock data until the openapi-fetch + TanStack Query data layer is
// wired up (next increment). Shapes mirror ProjectRow / ActivityRow from
// server/openapi.yaml so swapping in real data later is a straight fetch.
const heroProject: ProjectSummary = {
  id: '1',
  title: 'Synapse Landing Page',
  projectType: 'open_source',
  skills: ['react', 'tailwind'],
  updatedLabel: '2 hari lalu',
  contributorCount: 4,
};

const myProjects: ProjectSummary[] = [
  { id: '2', title: 'Mobile Redesign', projectType: 'hiring', skills: ['figma'], updatedLabel: '5 hari lalu', contributorCount: 2 },
  { id: '3', title: 'API Dokumentasi', projectType: 'personal', skills: ['node.js'], updatedLabel: '1 minggu lalu', contributorCount: 1 },
];

const activity: ActivityItemData[] = [
  { id: '1', actorInitials: 'AR', message: 'Ayu bergabung ke Synapse Landing Page', timeLabel: '2j' },
  { id: '2', actorInitials: 'DP', message: 'Dimas mengomentari Mobile Redesign', timeLabel: '5j' },
  { id: '3', actorInitials: 'BA', message: 'Kamu membuat API Dokumentasi', timeLabel: '1m' },
];

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-10 pt-6">
      <ScreenContainer className="gap-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Avatar fallback="BA" />
            <View>
              <Text variant="caption">Selamat datang kembali</Text>
              <Text variant="subheading">Bimo</Text>
            </View>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
            <IconSymbol name="bell.fill" size={18} color={Colors[colorScheme].icon} />
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-background bg-spark" />
          </View>
        </View>

        <FadeInUp className="flex-row gap-3">
          <StatCell value={myProjects.length + 1} label="Proyek aktif" />
          <StatCell value={7} label="Kolaborator" />
        </FadeInUp>

        <FadeInUp delay={60}>
          <ProjectHeroCard project={heroProject} />
        </FadeInUp>

        <FadeInUp delay={120} className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="subheading">Proyek saya</Text>
            <Text className="text-[13px] font-semibold text-primary">Lihat semua</Text>
          </View>
          <View className="flex-row gap-3">
            {myProjects.map((project) => (
              <ProjectCompactCard key={project.id} project={project} />
            ))}
          </View>
        </FadeInUp>

        <FadeInUp delay={180} className="gap-1">
          <Text variant="subheading" className="mb-1">
            Aktivitas terbaru
          </Text>
          {activity.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </FadeInUp>
      </ScreenContainer>
    </ScrollView>
  );
}

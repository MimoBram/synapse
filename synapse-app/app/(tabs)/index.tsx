import { BlurView } from 'expo-blur';
import { ScrollView, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityRow, type ActivityItemData } from '@/src/components/activity-row';
import { FadeInUp } from '@/src/components/fade-in-up';
import { ProjectCompactCard, ProjectHeroCard, type ProjectSummary } from '@/src/components/project-card';
import { ScreenContainer } from '@/src/components/screen-container';
import { StatCell } from '@/src/components/stat-cell';
import { StoriesBar, type CollaboratorShortcut } from '@/src/components/stories-bar';
import { Text } from '@/src/design-system/text';

// Static mock data until the openapi-fetch + TanStack Query data layer is
// wired up (next increment). Shapes mirror ProjectRow / ActivityRow from
// server/openapi.yaml so swapping in real data later is a straight fetch.
const collaboratorShortcuts: CollaboratorShortcut[] = [
  { id: '1', initials: 'AR', name: 'Ayu', active: true },
  { id: '2', initials: 'DP', name: 'Dimas', active: true },
  { id: '3', initials: 'NK', name: 'Nadia' },
  { id: '4', initials: 'FS', name: 'Fajar' },
  { id: '5', initials: 'RT', name: 'Rian' },
];

const feedProjects: ProjectSummary[] = [
  {
    id: '1',
    title: 'Synapse Landing Page',
    projectType: 'open_source',
    skills: ['react', 'tailwind'],
    updatedLabel: '2 hari lalu',
    contributorCount: 4,
    ownerName: 'Ayu Ratna',
    ownerInitials: 'AR',
    actionLabel: 'Join',
  },
  {
    id: '4',
    title: 'Design System Audit',
    projectType: 'hiring',
    skills: ['figma', 'design-ops'],
    updatedLabel: '1 hari lalu',
    contributorCount: 3,
    ownerName: 'Fajar Setiawan',
    ownerInitials: 'FS',
    actionLabel: 'Join',
  },
];

const myProjects: ProjectSummary[] = [
  {
    id: '2',
    title: 'Mobile Redesign',
    projectType: 'hiring',
    skills: ['figma'],
    updatedLabel: '5 hari lalu',
    contributorCount: 2,
    ownerName: 'Bimo',
    ownerInitials: 'BA',
    actionLabel: 'View',
  },
  {
    id: '3',
    title: 'API Dokumentasi',
    projectType: 'personal',
    skills: ['node.js'],
    updatedLabel: '1 minggu lalu',
    contributorCount: 1,
    ownerName: 'Bimo',
    ownerInitials: 'BA',
    actionLabel: 'View',
  },
];

const activity: ActivityItemData[] = [
  { id: '1', actorInitials: 'AR', message: 'Ayu bergabung ke Synapse Landing Page', timeLabel: '2j' },
  { id: '2', actorInitials: 'DP', message: 'Dimas mengomentari Mobile Redesign', timeLabel: '5j' },
  { id: '3', actorInitials: 'BA', message: 'Kamu membuat API Dokumentasi', timeLabel: '1m' },
];

const todayLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-32 pt-6">
      <ScreenContainer className="gap-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text variant="heading">Selamat pagi, Bimo</Text>
            <Text variant="caption" className="mt-0.5">
              {todayLabel}
            </Text>
          </View>
          <View className="h-11 w-11 overflow-hidden rounded-full border border-white/15">
            <BlurView intensity={70} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={{ flex: 1 }}>
              <View className="flex-1 items-center justify-center bg-card/40">
                <IconSymbol name="bell.fill" size={18} color={Colors[colorScheme].icon} />
              </View>
            </BlurView>
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-background bg-spark" />
          </View>
        </View>

        <FadeInUp>
          <StoriesBar items={collaboratorShortcuts} />
        </FadeInUp>

        <FadeInUp delay={40} className="flex-row gap-3">
          <StatCell value={myProjects.length + feedProjects.length} label="Proyek aktif" />
          <StatCell value={7} label="Kolaborasi" />
          <StatCell value={5} label="Skill" />
        </FadeInUp>

        <FadeInUp delay={80} className="gap-3">
          <Text variant="subheading">Temukan proyek</Text>
          {feedProjects.map((project) => (
            <ProjectHeroCard key={project.id} project={project} />
          ))}
        </FadeInUp>

        <FadeInUp delay={140} className="gap-3">
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

        <FadeInUp delay={200} className="gap-1">
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

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/src/lib/utils';

const ROUTE_ICONS: Record<string, IconSymbolName> = {
  index: 'house.fill',
  explore: 'paperplane.fill',
};

/**
 * Floating glass dock replacing the default tab bar — BlurView for the
 * frosted-glass effect, rounded-full pill, subtle light border for the
 * glass "rim" highlight (see the reference screenshots this was built
 * from). Registered as the `tabBar` render prop on <Tabs>.
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View
      className="absolute inset-x-10 items-center overflow-hidden rounded-full border border-white/15"
      style={{
        bottom: insets.bottom + 12,
        shadowColor: '#1c143c',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 8,
      }}>
      <BlurView intensity={70} tint={colorScheme === 'dark' ? 'dark' : 'light'}>
        <View className="flex-row items-center gap-1 bg-card/55 px-2 py-2">
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const label = descriptors[route.key].options.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={isFocused ? { selected: true } : {}}
                hitSlop={4}
                className={cn('h-12 w-12 items-center justify-center rounded-full', isFocused && 'bg-primary')}>
                <IconSymbol
                  name={ROUTE_ICONS[route.name] ?? 'house.fill'}
                  size={22}
                  color={isFocused ? '#ffffff' : Colors[colorScheme].icon}
                />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

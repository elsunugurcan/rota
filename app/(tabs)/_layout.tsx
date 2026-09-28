import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { Icon, type IconName } from "@/components/Icon";
import { C } from "@/theme";
const tab = (title: string, icon: IconName) => ({ title, tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={22} color={String(color)} stroke={2.2} /> });
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg }, tabBarActiveTintColor: C.accent, tabBarInactiveTintColor: C.muted, tabBarStyle: { backgroundColor: C.card, borderTopColor: C.line, height: 64, paddingTop: 6 }, tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600", marginBottom: 6 }, tabBarItemStyle: { paddingHorizontal: 0 }, tabBarAllowFontScaling: false }}>
      <Tabs.Screen name="index" options={tab("Harita", "pin")} />
      <Tabs.Screen name="duraklar" options={tab("Duraklar", "search")} />
      <Tabs.Screen name="rota" options={tab("Rota", "navigation")} />
      <Tabs.Screen name="kart" options={tab("Kart", "card")} />
      <Tabs.Screen name="daha" options={tab("Daha", "settings")} />
    </Tabs>
  );
}

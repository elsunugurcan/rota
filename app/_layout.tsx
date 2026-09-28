import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "@/store";
import { C } from "@/theme";

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    if (Platform.OS === "web") (globalThis as unknown as { Rota: typeof useStore }).Rota = useStore; // web testleri için
    return unsub;
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {hydrated ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: "slide_from_right" }}>
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen name="durak/[id]" />
          <Stack.Screen name="hat/[id]" />
        </Stack>
      ) : <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.accent} /></View>}
    </SafeAreaProvider>
  );
}

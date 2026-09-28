import { useMemo, useState } from "react";
import { Pressable, SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { StopRow, Card, LineBadge } from "@/components/transit";
import { H2, Input, Label, Row, Small, T } from "@/components/ui";
import { LINES, STOPS, USER_LOCATION, stopById } from "@/data/city";
import { fmtMeters, foldTr, nearestStops, searchStops } from "@/lib/transit";
import { useStore } from "@/store";
import { C, S } from "@/theme";
import { useRouter } from "expo-router";

export default function StopsScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(params.q ?? "");
  const favorites = useStore((s) => s.favorites); const router = useRouter();
  const lines = useMemo(() => { const f = foldTr(q.trim()); return f ? LINES.filter((l) => foldTr(l.id).includes(f) || foldTr(l.name).includes(f)) : []; }, [q]);
  const sections = useMemo(() => {
    if (q.trim()) return [{ title: "Sonuçlar", data: searchStops(q).map((s) => s.id) }];
    const near = nearestStops(USER_LOCATION, 3);
    const zones = Array.from(new Set(STOPS.map((s) => s.zone)));
    return [
      ...(favorites.length ? [{ title: "Favoriler", data: favorites }] : []),
      { title: "Yakınımdakiler", data: near.map((n) => n.stop.id), meta: Object.fromEntries(near.map((n) => [n.stop.id, fmtMeters(n.meters)])) },
      ...zones.map((z) => ({ title: z, data: STOPS.filter((s) => s.zone === z).map((s) => s.id) })),
    ];
  }, [q, favorites]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
      <View style={{ paddingHorizontal: S.lg, paddingTop: S.lg, gap: S.md }}>
        <H2>Duraklar</H2>
        <Input placeholder="Durak, semt veya hat ara… (örn. hastane, T1)" value={q} onChangeText={setQ} autoCorrect={false} returnKeyType="search" />
        {lines.length > 0 && <Row gap={S.sm} style={{ flexWrap: "wrap" }}>{lines.map((l) => <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={`${l.id} hattı`} onPress={() => router.push(`/hat/${l.id}`)} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.card, borderRadius: 999, paddingRight: 10, paddingLeft: 4, paddingVertical: 4, borderWidth: 1, borderColor: C.line }}><LineBadge id={l.id} size="sm" /><Small color={C.text2}>{l.name}</Small></Pressable>)}</Row>}
      </View>
      <SectionList sections={sections as { title: string; data: string[]; meta?: Record<string, string> }[]} keyExtractor={(id, i) => id + i} stickySectionHeadersEnabled={false} contentContainerStyle={{ paddingHorizontal: S.lg, paddingBottom: S.xxl }}
        renderSectionHeader={({ section }) => <Label style={{ marginTop: S.lg, marginBottom: S.xs }}>{section.title}</Label>}
        renderItem={({ item, section }) => <StopRow id={item} subtitle={(section as { meta?: Record<string, string> }).meta?.[item] ?? stopById(item).zone} />}
        ListEmptyComponent={<Card><T>Sonuç yok. Farklı bir kelime deneyin.</T></Card>} />
    </SafeAreaView>
  );
}

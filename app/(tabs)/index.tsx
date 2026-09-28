import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TransitMap } from "@/components/TransitMap";
import { ArrivalRow, Card, LineBadge, LiveDot } from "@/components/transit";
import { Button, H3, Row, Small, T } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { USER_LOCATION, linesAtStop, stopById } from "@/data/city";
import { arrivalsAt, fmtMeters, nearestStops, walkSec } from "@/lib/transit";
import { useVehicles } from "@/lib/useClock";
import { useStore } from "@/store";
import { C, R, S } from "@/theme";

export default function MapScreen() {
  const router = useRouter();
  const { t, vehicles } = useVehicles();
  const [sel, setSel] = useState<string | null>(null);
  const lowData = useStore((s) => s.lowData);
  const favorites = useStore((s) => s.favorites); const toggleFavorite = useStore((s) => s.toggleFavorite);
  const near = nearestStops(USER_LOCATION, 3);
  const arrivals = sel ? arrivalsAt(sel, t).slice(0, 4) : [];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TransitMap vehicles={vehicles} selectedStop={sel} onSelectStop={setSel} lowData={lowData} controlsTop={150} />
      <SafeAreaView edges={["top"]} pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        <View pointerEvents="box-none" style={{ padding: S.md, gap: S.sm }}>
          <Pressable accessibilityRole="search" accessibilityLabel="Durak veya hat ara" onPress={() => router.push("/duraklar")} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: C.line }}>
            <Icon name="search" size={18} color={C.muted} /><T color={C.muted}>Durak veya hat ara…</T>
          </Pressable>
          <Row style={{ justifyContent: "space-between" }}>
            <View style={{ backgroundColor: C.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.line }}><LiveDot label={`Canlı · ${vehicles.length} araç yolda`} /></View>
            {lowData && <View style={{ backgroundColor: C.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.line }}><Row gap={6}><Icon name="wifiOff" size={14} color={C.amber} /><Small color={C.amber}>Düşük veri</Small></Row></View>}
          </Row>
        </View>
      </SafeAreaView>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: S.md }} pointerEvents="box-none">
        {sel ? (
          <Card style={{ gap: S.sm }}>
            <Row style={{ justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <H3>{stopById(sel).name}</H3>
                <Row gap={4} style={{ marginTop: 4 }}>{linesAtStop(sel).map((l) => <LineBadge key={l.id} id={l.id} size="sm" />)}<Small style={{ marginLeft: 4 }}>{stopById(sel).zone}</Small></Row>
              </View>
              <Row gap={S.sm}>
                <Pressable accessibilityRole="button" accessibilityLabel={favorites.includes(sel) ? "Favorilerden çıkar" : "Favorilere ekle"} onPress={() => toggleFavorite(sel)} style={{ padding: 6 }}><Icon name="star" size={22} color={favorites.includes(sel) ? C.amber : C.muted} stroke={2} /></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={() => setSel(null)} style={{ padding: 6 }}><Icon name="x" size={20} color={C.muted} /></Pressable>
              </Row>
            </Row>
            {arrivals.map((a) => <ArrivalRow key={`${a.vehicleId}-${a.dir}`} a={a} compact />)}
            <Button title="Durak detayı" small tone="ghost" icon="right" onPress={() => router.push(`/durak/${sel}`)} testID="stop-detail" />
          </Card>
        ) : (
          <Card style={{ gap: 4 }}>
            <Row style={{ justifyContent: "space-between" }}><Small style={{ fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>Yakınımdaki duraklar</Small><Small>Konum: Merkez</Small></Row>
            {near.map(({ stop, meters }) => (
              <Pressable key={stop.id} accessibilityRole="button" accessibilityLabel={`${stop.name} durağı, ${fmtMeters(meters)}`} onPress={() => setSel(stop.id)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line }}>
                <View style={{ flex: 1 }}><T color={C.text} style={{ fontWeight: "600" }}>{stop.name}</T><Row gap={4} style={{ marginTop: 2 }}>{linesAtStop(stop.id).map((l) => <LineBadge key={l.id} id={l.id} size="sm" />)}</Row></View>
                <Row gap={4}><Icon name="walk" size={14} color={C.muted} /><Small>{fmtMeters(meters)} · {Math.round(walkSec(meters) / 60)} dk</Small></Row>
              </Pressable>
            ))}
          </Card>
        )}
      </View>
    </View>
  );
}

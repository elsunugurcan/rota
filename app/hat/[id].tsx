import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TransitMap } from "@/components/TransitMap";
import { Card, LineBadge, LiveDot, Occupancy } from "@/components/transit";
import { Header, Label, Row, Screen, Small, T } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ALERTS, lineById, stopById } from "@/data/city";
import { linePath, oneWaySec } from "@/lib/transit";
import { useVehicles } from "@/lib/useClock";
import { useStore } from "@/store";
import { C, S } from "@/theme";

export default function LineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter();
  const line = lineById(String(id)); const { vehicles } = useVehicles(); const lowData = useStore((s) => s.lowData);
  if (!line) return <Screen><Header title="Hat bulunamadı" back /></Screen>;
  const path = linePath(line); const mine = vehicles.filter((v) => v.lineId === line.id);
  const alerts = ALERTS.filter((a) => a.lineId === line.id);
  const km = ((path.length * 10) / 1000).toFixed(1).replace(".", ",");
  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: S.lg }}>
        <Header title={line.name} subtitle={`${line.kind === "tram" ? "Tramvay" : "Otobüs"} hattı`} back right={<LineBadge id={line.id} size="lg" />} />
        <Row gap={S.md} style={{ marginBottom: S.md }}>
          {[["Sıklık", `${line.headwayMin} dk`], ["Sefer saatleri", `${line.first}–${line.last}`], ["Uzunluk", `${km} km`], ["Tek yön", `${Math.round(oneWaySec(line) / 60)} dk`]].map(([l, v]) => <View key={l} style={{ flex: 1 }}><Small>{l}</Small><T color={C.text} style={{ fontWeight: "700" }}>{v}</T></View>)}
        </Row>
      </View>
      <TransitMap vehicles={vehicles} highlightLines={[line.id]} initial={{ x: Math.min(...path.pts.map((p) => p.x)) - 80, y: Math.min(...path.pts.map((p) => p.y)) - 60, w: Math.max(...path.pts.map((p) => p.x)) - Math.min(...path.pts.map((p) => p.x)) + 200 }} height={220} lowData={lowData} showUser={false} onSelectStop={(sid) => router.push(`/durak/${sid}`)} />
      <View style={{ paddingHorizontal: S.lg, paddingTop: S.lg, gap: S.md }}>
        {alerts.map((a) => <Card key={a.id} style={{ borderColor: C.amber + "66", gap: 4 }}><Row gap={6}><Icon name="bell" size={16} color={C.amber} /><T color={C.text} style={{ fontWeight: "700" }}>{a.title}</T></Row><Small>{a.text}</Small></Card>)}
        <Row style={{ justifyContent: "space-between" }}><Label>Duraklar ve araçlar</Label><LiveDot label={`${mine.length} araç yolda`} /></Row>
        <Card style={{ paddingVertical: S.sm }} testID="line-stops">
          {line.stops.map((sid, i) => {
            const here = mine.filter((v) => (v.dir === 0 ? v.nextStopIdx === i + 1 || (i === 0 && v.nextStopIdx === 0) : v.nextStopIdx === i - 1 || (i === line.stops.length - 1 && v.nextStopIdx === line.stops.length - 1)));
            return (
              <Pressable key={sid} accessibilityRole="button" accessibilityLabel={`${stopById(sid).name} durağı`} onPress={() => router.push(`/durak/${sid}`)} style={{ flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: 10 }}>
                <View style={{ width: 24, alignItems: "center" }}>
                  <View style={{ position: "absolute", top: i === 0 ? 12 : -14, bottom: i === line.stops.length - 1 ? 12 : -14, width: 4, backgroundColor: line.color }} />
                  <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff", borderWidth: 3, borderColor: line.color }} />
                </View>
                <View style={{ flex: 1 }}><T color={C.text} style={{ fontWeight: "600" }}>{stopById(sid).name}</T><Small>{stopById(sid).zone}{i === 0 ? " · başlangıç" : i === line.stops.length - 1 ? " · son durak" : ""}</Small></View>
                {here.map((v) => <Row key={v.id} gap={6} style={{ backgroundColor: line.color + "22", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}><Icon name={line.kind === "tram" ? "tram" : "bus"} size={14} color={line.color} /><Small color={C.text}>{v.dir === 0 ? "↓" : "↑"}</Small><Occupancy v={v.occupancy} /></Row>)}
              </Pressable>);
          })}
        </Card>
      </View>
    </Screen>
  );
}

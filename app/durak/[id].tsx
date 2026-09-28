import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TransitMap } from "@/components/TransitMap";
import { ArrivalRow, Card, LineBadge, LiveDot } from "@/components/transit";
import { Header, Label, Row, Screen, Small, T, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ALERTS, linesAtStop, stopById } from "@/data/city";
import { arrivalsAt, fmtClock } from "@/lib/transit";
import { useVehicles } from "@/lib/useClock";
import { useStore } from "@/store";
import { C, S } from "@/theme";

export default function StopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter();
  const stop = stopById(String(id)); const { t, vehicles } = useVehicles();
  const favorites = useStore((s) => s.favorites); const toggleFavorite = useStore((s) => s.toggleFavorite); const lowData = useStore((s) => s.lowData);
  if (!stop) return <Screen><Header title="Durak bulunamadı" back /></Screen>;
  const lines = linesAtStop(stop.id); const arrivals = arrivalsAt(stop.id, t);
  const alerts = ALERTS.filter((a) => a.lineId && lines.some((l) => l.id === a.lineId));
  const fav = favorites.includes(stop.id);
  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: S.lg }}>
        <Header title={stop.name} subtitle={`${stop.zone} · Durak ${stop.id.toUpperCase().slice(0, 3)}-${String(stop.x + stop.y).slice(-3)}`} back right={<Pressable accessibilityRole="button" accessibilityLabel={fav ? "Favorilerden çıkar" : "Favorilere ekle"} onPress={() => toggleFavorite(stop.id)} style={{ padding: 8 }} testID="fav-toggle"><Icon name="star" size={26} color={fav ? C.amber : C.muted} stroke={2} /></Pressable>} />
        <Row gap={S.sm} style={{ flexWrap: "wrap", marginBottom: S.md }}>{lines.map((l) => <LineBadge key={l.id} id={l.id} onPress />)}{stop.accessible === false ? <Row gap={4}><Icon name="wheelchair" size={16} color={C.amber} /><Small color={C.amber}>Erişilebilir değil</Small></Row> : <Row gap={4}><Icon name="wheelchair" size={16} color={C.green} /><Small color={C.green}>Erişilebilir</Small></Row>}</Row>
      </View>
      <TransitMap vehicles={vehicles} selectedStop={stop.id} highlightLines={lines.map((l) => l.id)} initial={{ x: stop.x - 220, y: stop.y - 120, w: 440 }} height={200} lowData={lowData} showUser={false} onSelectStop={(sid) => router.push(`/durak/${sid}`)} />
      <View style={{ paddingHorizontal: S.lg, paddingTop: S.lg, gap: S.md }}>
        {alerts.map((a) => <Card key={a.id} style={{ borderColor: a.severity === "uyari" ? C.amber + "66" : C.line, gap: 4 }}><Row gap={6}><Icon name="bell" size={16} color={C.amber} /><T color={C.text} style={{ fontWeight: "700" }}>{a.title}</T></Row><Small>{a.text}</Small></Card>)}
        <Row style={{ justifyContent: "space-between" }}><Label>Yaklaşan araçlar</Label><LiveDot label={`Güncellendi ${fmtClock(new Date(t * 1000))}`} /></Row>
        <Card style={{ paddingVertical: 4 }} testID="arrivals">{arrivals.map((a) => <ArrivalRow key={`${a.vehicleId}-${a.dir}-${a.etaSec}`} a={a} />)}</Card>
        <Button title="Buraya rota planla" icon="navigation" onPress={() => router.push({ pathname: "/(tabs)/rota", params: { to: stop.id } })} testID="plan-here" />
        <Label>Bu duraktan geçen hatlar</Label>
        {lines.map((l) => <Pressable key={l.id} accessibilityRole="button" onPress={() => router.push(`/hat/${l.id}`)} style={{ flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}><LineBadge id={l.id} /><View style={{ flex: 1 }}><T color={C.text} style={{ fontWeight: "600" }}>{l.name}</T><Small>{l.kind === "tram" ? "Tramvay" : "Otobüs"} · her {l.headwayMin} dk · {l.first}–{l.last}</Small></View><Icon name="right" size={18} color={C.muted} /></Pressable>)}
      </View>
    </Screen>
  );
}

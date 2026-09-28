import { Pressable, Switch, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, LineBadge } from "@/components/transit";
import { Button, Header, Label, Row, Screen, Small, T } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ALERTS, LINES } from "@/data/city";
import { useStore } from "@/store";
import { C, S } from "@/theme";

export default function MoreScreen() {
  const router = useRouter();
  const lowData = useStore((s) => s.lowData); const setLowData = useStore((s) => s.setLowData);
  const largeText = useStore((s) => s.largeText); const setLargeText = useStore((s) => s.setLargeText);
  const reset = useStore((s) => s.reset);
  return (
    <Screen>
      <Header title="Daha" subtitle="Duyurular, hatlar ve ayarlar" />
      <Label style={{ marginBottom: S.sm }}>Duyurular</Label>
      <View style={{ gap: S.sm }}>{ALERTS.map((a) => <Card key={a.id} style={{ gap: 4, borderColor: a.severity === "uyari" ? C.amber + "66" : C.line }} testID="alert"><Row gap={8}>{a.lineId && <LineBadge id={a.lineId} size="sm" onPress />}<T color={C.text} style={{ fontWeight: "700", flex: 1 }}>{a.title}</T><Icon name={a.severity === "uyari" ? "bell" : "info"} size={16} color={a.severity === "uyari" ? C.amber : C.cyan} /></Row><Small>{a.text}</Small><Small color={C.muted}>{a.from} – {a.to}</Small></Card>)}</View>
      <Label style={{ marginTop: S.xl, marginBottom: S.sm }}>Hatlar</Label>
      <Card style={{ paddingVertical: 4 }}>{LINES.map((l) => <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={`${l.id} ${l.name}`} onPress={() => router.push(`/hat/${l.id}`)} style={{ flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}><LineBadge id={l.id} /><View style={{ flex: 1 }}><T color={C.text} style={{ fontWeight: "600" }}>{l.name}</T><Small>{l.kind === "tram" ? "Tramvay" : "Otobüs"} · her {l.headwayMin} dk</Small></View><Icon name="right" size={18} color={C.muted} /></Pressable>)}</Card>
      <Label style={{ marginTop: S.xl, marginBottom: S.sm }}>Ayarlar</Label>
      <Card style={{ gap: S.md }}>
        <Row style={{ justifyContent: "space-between" }}><View style={{ flex: 1 }}><T color={C.text} style={{ fontWeight: "600" }}>Düşük veri modu</T><Small>Harita süslemelerini ve canlı yenilemeyi azaltır</Small></View><Switch value={lowData} onValueChange={setLowData} trackColor={{ true: C.accent, false: C.card2 }} accessibilityLabel="Düşük veri modu" /></Row>
        <Row style={{ justifyContent: "space-between" }}><View style={{ flex: 1 }}><T color={C.text} style={{ fontWeight: "600" }}>Büyük yazı</T><Small>Ekran okuyucu ve görme desteği</Small></View><Switch value={largeText} onValueChange={setLargeText} trackColor={{ true: C.accent, false: C.card2 }} accessibilityLabel="Büyük yazı" /></Row>
      </Card>
      <Card style={{ marginTop: S.md, gap: S.sm }}>
        <T color={C.text} style={{ fontWeight: "600" }}>Rota Ulaşım v1.0</T>
        <Small>Araç konumları belediye GTFS-Realtime akışından saniyede bir güncellenir; durak varış tahminleri araç hızı ve durak bekleme sürelerinden hesaplanır. Bu sürümde veri çevrimdışı örnek ağ üzerinden simüle edilmektedir.</Small>
        <Button title="Verileri sıfırla" tone="danger" small onPress={reset} />
      </Card>
    </Screen>
  );
}

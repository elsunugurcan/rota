import { useState } from "react";
import { View } from "react-native";
import { Card } from "@/components/transit";
import { Button, Chip, H1, H2, Header, Label, Row, Screen, Small, T } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { FARE } from "@/lib/transit";
import { useStore } from "@/store";
import { C, S } from "@/theme";

export default function CardScreen() {
  const card = useStore((s) => s.card); const topUp = useStore((s) => s.topUp); const pay = useStore((s) => s.pay);
  const [amount, setAmount] = useState(100); const [msg, setMsg] = useState<string | null>(null);
  const ride = () => { const ok = pay("T1 Tramvay · Vapur İskelesi (QR)", FARE); setMsg(ok ? `Biniş onaylandı · ${FARE} ₺ düşüldü` : "Yetersiz bakiye"); setTimeout(() => setMsg(null), 2500); };
  return (
    <Screen>
      <Header title="Kentkart" subtitle="Ulaşım kartı" />
      <View style={{ backgroundColor: C.accent, borderRadius: 22, padding: S.xl, gap: S.xl, overflow: "hidden" }}>
        <View style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.12)" }} />
        <Row style={{ justifyContent: "space-between" }}><T color="#fff" style={{ fontWeight: "800", fontSize: 18 }}>Rota Ulaşım</T><Icon name="card" size={22} color="#fff" /></Row>
        <View><Small color="rgba(255,255,255,0.75)">Bakiye</Small><H1 color="#fff" testID="balance">{card.balance.toFixed(2).replace(".", ",")} ₺</H1></View>
        <Row style={{ justifyContent: "space-between" }}><T color="#fff" style={{ fontVariant: ["tabular-nums"] }}>{card.number}</T><Small color="rgba(255,255,255,0.75)">Tam bilet · {FARE} ₺</Small></Row>
      </View>
      <Card style={{ marginTop: S.md, gap: S.md }}>
        <Label>Bakiye yükle</Label>
        <Row gap={S.sm}>{[50, 100, 200].map((a) => <Chip key={a} label={`${a} ₺`} active={amount === a} onPress={() => setAmount(a)} />)}</Row>
        <Button title={`${amount} ₺ yükle`} icon="plus" onPress={() => { topUp(amount + (amount >= 200 ? 10 : 0)); setMsg(amount >= 200 ? `${amount} ₺ + 10 ₺ hediye yüklendi` : `${amount} ₺ yüklendi`); setTimeout(() => setMsg(null), 2500); }} testID="topup" />
        <Small>200 ₺ ve üzeri yüklemelerde 10 ₺ hediye bakiye. Kart ödemesi banka altyapısıyla şifreli işlenir.</Small>
      </Card>
      <Row gap={S.sm} style={{ marginTop: S.md }}>
        <Button title="QR ile bin" tone="cyan" icon="bolt" onPress={ride} style={{ flex: 1 }} testID="ride" />
        <Button title="Kartı kaybettim" tone="ghost" onPress={() => { setMsg("Kart bloke talebiniz alındı (demo)"); setTimeout(() => setMsg(null), 2500); }} style={{ flex: 1 }} />
      </Row>
      {msg && <View style={{ marginTop: S.md, backgroundColor: C.greenSoft, borderRadius: 12, padding: 12 }}><T color={C.green} style={{ fontWeight: "600" }} testID="card-msg">{msg}</T></View>}
      <Label style={{ marginTop: S.xl, marginBottom: S.sm }}>Son işlemler</Label>
      <Card style={{ paddingVertical: 4 }} testID="tx-list">
        {card.tx.slice(0, 8).map((t) => (
          <Row key={t.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }} gap={S.md}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.amount > 0 ? C.greenSoft : C.card2, alignItems: "center", justifyContent: "center" }}><Icon name={t.type === "yukleme" ? "plus" : t.type === "aktarma" ? "swap" : "bus"} size={16} color={t.amount > 0 ? C.green : C.text2} /></View>
            <View style={{ flex: 1 }}><T color={C.text} numberOfLines={1}>{t.label}</T><Small>{new Date(t.at).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Small></View>
            <T color={t.amount > 0 ? C.green : C.text} style={{ fontWeight: "700" }}>{t.amount > 0 ? "+" : ""}{t.amount.toFixed(2).replace(".", ",")} ₺</T>
          </Row>
        ))}
      </Card>
      <H2 style={{ display: "none" }}>Kart</H2>
    </Screen>
  );
}

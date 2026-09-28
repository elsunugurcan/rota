import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, LineBadge } from "@/components/transit";
import { Button, H2, H3, Input, Label, Row, Small, T } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { USER_LOCATION, lineById, stopById } from "@/data/city";
import { fmtMeters, fmtMin, planFromPoint, planRoute, searchStops, type Plan } from "@/lib/transit";
import { useStore } from "@/store";
import { C, R, S } from "@/theme";

const HERE = "__konum";
function Picker({ label, value, onChange, allowHere, testID }: { label: string; value: string; onChange: (v: string) => void; allowHere?: boolean; testID: string }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState("");
  const list = useMemo(() => searchStops(q).slice(0, 8), [q]);
  const name = value === HERE ? "Konumum" : value ? stopById(value).name : "";
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${name || "seçilmedi"}`} onPress={() => setOpen((o) => !o)} testID={testID} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: open ? C.accent : C.line, borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12 }}>
        <Icon name={value === HERE ? "locate" : "pin"} size={18} color={value ? C.accent : C.muted} /><T color={name ? C.text : C.muted} style={{ flex: 1 }}>{name || "Durak seçin"}</T><Icon name="right" size={16} color={C.muted} />
      </Pressable>
      {open && (
        <Card style={{ padding: S.sm, gap: 4 }}>
          <Input placeholder="Durak ara…" value={q} onChangeText={setQ} autoFocus />
          {allowHere && <Pressable accessibilityRole="button" onPress={() => { onChange(HERE); setOpen(false); }} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10 }}><Icon name="locate" size={18} color={C.accent} /><T color={C.text}>Konumum</T></Pressable>}
          {list.map((s) => <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={s.name} onPress={() => { onChange(s.id); setOpen(false); setQ(""); }} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderTopWidth: 1, borderTopColor: C.line }}><Icon name="pin" size={16} color={C.muted} /><T color={C.text} style={{ flex: 1 }}>{s.name}</T><Small>{s.zone}</Small></Pressable>)}
        </Card>
      )}
    </View>
  );
}

export default function RouteScreen() {
  const params = useLocalSearchParams<{ to?: string }>(); const router = useRouter();
  const [from, setFrom] = useState(HERE); const [to, setTo] = useState(params.to ?? "");
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);
  const recent = useStore((s) => s.recent); const addRecent = useStore((s) => s.addRecent);
  useEffect(() => { if (params.to) { setTo(params.to); setPlan(undefined); } }, [params.to]);
  const run = () => { if (!to) return; const p = from === HERE ? planFromPoint({ ...USER_LOCATION, name: "Konumum" }, to) : planRoute(from, to); setPlan(p); if (p) addRecent({ from, to }); };
  const swap = () => { if (from === HERE) return; const f = from; setFrom(to || HERE); setTo(f); setPlan(undefined); };
  const dep = new Date(); const arr = plan ? new Date(dep.getTime() + plan.totalSec * 1000) : null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: S.lg, gap: S.md, paddingBottom: S.xxl }} keyboardShouldPersistTaps="handled">
        <H2>Rota planla</H2>
        <Row gap={S.sm} style={{ alignItems: "flex-end" }}>
          <View style={{ flex: 1, gap: S.md }}>
            <Picker label="Nereden" value={from} onChange={(v) => { setFrom(v); setPlan(undefined); }} allowHere testID="from" />
            <Picker label="Nereye" value={to} onChange={(v) => { setTo(v); setPlan(undefined); }} testID="to" />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Yer değiştir" onPress={swap} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.card2, alignItems: "center", justifyContent: "center", marginBottom: 2 }}><Icon name="swap" size={20} color={C.text} /></Pressable>
        </Row>
        <Button title="Rota bul" icon="navigation" onPress={run} disabled={!to || to === from} testID="find-route" />
        {plan === null && <Card><T>Bu iki nokta arasında rota bulunamadı.</T></Card>}
        {plan && (
          <Card style={{ gap: S.md }} testID="plan">
            <Row style={{ justifyContent: "space-between" }}>
              <View><Small>Toplam</Small><H3>{fmtMin(plan.totalSec)}</H3></View>
              <View><Small>Aktarma</Small><H3>{plan.transfers}</H3></View>
              <View><Small>Yürüme</Small><H3>{fmtMeters(plan.walkMeters)}</H3></View>
              <View><Small>Ücret</Small><H3 color={C.green}>{plan.fare} ₺</H3></View>
            </Row>
            <Small>Kalkış {dep.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · Varış {arr!.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · Kentkart ile aktarma indirimi uygulandı</Small>
            <View style={{ borderTopWidth: 1, borderTopColor: C.line }}>
              {plan.legs.map((leg, i) => (
                <Row key={i} gap={S.md} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line, alignItems: "flex-start" }}>
                  <View style={{ width: 44, alignItems: "center", paddingTop: 2 }}>{leg.kind === "ride" ? <LineBadge id={leg.lineId} onPress /> : <Icon name="walk" size={22} color={C.text2} />}</View>
                  <View style={{ flex: 1 }}>
                    {leg.kind === "walk" && <><T color={C.text} style={{ fontWeight: "600" }}>{leg.to.name} durağına yürü</T><Small>{fmtMeters(leg.meters)} · {fmtMin(leg.sec)}</Small></>}
                    {leg.kind === "ride" && <><T color={C.text} style={{ fontWeight: "600" }}>{lineById(leg.lineId).name}</T><Small>{stopById(leg.from).name} → {stopById(leg.to).name} · {leg.stops.length - 1} durak · {fmtMin(leg.sec)}</Small><Small>Beklenen bekleme ~{fmtMin(leg.waitSec)}{i > 0 && plan.legs[i - 1].kind === "ride" ? " · aktarma" : ""}</Small></>}
                  </View>
                </Row>
              ))}
            </View>
            <Button title="Haritada göster" small tone="ghost" icon="pin" onPress={() => router.push(`/durak/${to}`)} />
          </Card>
        )}
        {recent.length > 0 && !plan && (
          <View style={{ gap: S.sm }}><Label>Son aramalar</Label>{recent.map((r) => <Pressable key={r.from + r.to} accessibilityRole="button" onPress={() => { setFrom(r.from); setTo(r.to); setPlan(undefined); }} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card, borderRadius: R.md, padding: 12, borderWidth: 1, borderColor: C.line }}><Icon name="clock" size={16} color={C.muted} /><T color={C.text} style={{ flex: 1 }}>{r.from === HERE ? "Konumum" : stopById(r.from).name} → {stopById(r.to).name}</T><Icon name="right" size={16} color={C.muted} /></Pressable>)}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

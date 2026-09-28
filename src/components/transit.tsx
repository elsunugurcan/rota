import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { lineById, linesAtStop, stopById } from "@/data/city";
import { fmtMin, type Arrival } from "@/lib/transit";
import { C, R, S } from "@/theme";
import { Row, Small, T } from "./ui";
import { Icon } from "./Icon";

export function LineBadge({ id, size = "md", onPress }: { id: string; size?: "sm" | "md" | "lg"; onPress?: boolean }) {
  const l = lineById(id); const router = useRouter();
  const px = size === "sm" ? 6 : size === "lg" ? 12 : 8, fs = size === "sm" ? 11 : size === "lg" ? 18 : 13;
  const inner = <View style={{ backgroundColor: l.color, borderRadius: 6, paddingHorizontal: px, paddingVertical: size === "lg" ? 4 : 2, minWidth: size === "lg" ? 44 : 30, alignItems: "center" }}><T color="#fff" style={{ fontWeight: "800", fontSize: fs, lineHeight: fs + 6 }}>{l.id}</T></View>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`${l.id} hattı`} onPress={() => router.push(`/hat/${l.id}`)}>{inner}</Pressable> : inner;
}
export function Occupancy({ v }: { v: Arrival["occupancy"] }) {
  const color = v === "az" ? C.green : v === "orta" ? C.amber : C.red, n = v === "az" ? 1 : v === "orta" ? 2 : 3;
  return <View accessibilityLabel={`Doluluk: ${v}`} style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>{[0, 1, 2].map((i) => <View key={i} style={{ width: 5, height: 8 + i * 3, borderRadius: 2, backgroundColor: i < n ? color : C.card2 }} />)}</View>;
}
export function ArrivalRow({ a, compact }: { a: Arrival; compact?: boolean }) {
  const soon = a.etaSec < 90;
  return (
    <Row style={{ paddingVertical: compact ? 8 : 12, borderBottomWidth: 1, borderBottomColor: C.line }} gap={S.md}>
      <LineBadge id={a.lineId} onPress />
      <View style={{ flex: 1 }}>
        <T color={C.text} style={{ fontWeight: "600" }} numberOfLines={1}>→ {a.headsign}</T>
        <Small>{a.scheduled ? "Tarifeye göre" : `${a.stopsAway} durak uzakta · canlı`}</Small>
      </View>
      {!a.scheduled && <Occupancy v={a.occupancy} />}
      <View style={{ alignItems: "flex-end", minWidth: 56 }}>
        <T color={soon ? C.green : C.text} style={{ fontWeight: "800", fontSize: 18 }} testID="eta">{fmtMin(a.etaSec)}</T>
        {!a.scheduled && soon && <Small color={C.green}>Yaklaşıyor</Small>}
      </View>
    </Row>
  );
}
export function StopRow({ id, subtitle, right, onPress }: { id: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void }) {
  const s = stopById(id); const router = useRouter();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${s.name} durağı`} onPress={onPress ?? (() => router.push(`/durak/${id}`))} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" }}><Icon name="pin" size={18} color={C.accent} /></View>
      <View style={{ flex: 1 }}>
        <T color={C.text} style={{ fontWeight: "600" }}>{s.name}</T>
        <Row gap={4} style={{ marginTop: 3, flexWrap: "wrap" }}>{linesAtStop(id).map((l) => <LineBadge key={l.id} id={l.id} size="sm" />)}{subtitle ? <Small style={{ marginLeft: 4 }}>{subtitle}</Small> : null}</Row>
      </View>
      {right ?? <Icon name="right" size={18} color={C.muted} />}
    </Pressable>
  );
}
export const Card = ({ children, style, testID }: { children: React.ReactNode; style?: object; testID?: string }) => <View testID={testID} style={[{ backgroundColor: C.card, borderRadius: R.lg, padding: S.lg, borderWidth: 1, borderColor: C.line }, style]}>{children}</View>;
export const LiveDot = ({ label }: { label: string }) => <Row gap={6}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green }} /><Small color={C.text2}>{label}</Small></Row>;

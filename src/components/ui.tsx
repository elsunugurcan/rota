import { type ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text as RNText, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import { C, F, R, S } from "@/theme";
import { Icon, type IconName } from "./Icon";

/* ---------- metin ---------- */
type TP = { children: ReactNode; style?: StyleProp<TextStyle>; color?: string; testID?: string; numberOfLines?: number };
export const H1 = ({ children, style, color, testID }: TP) => <RNText testID={testID} style={[{ fontSize: F.h1, fontWeight: "800", color: color ?? C.text, letterSpacing: -0.5 }, style]}>{children}</RNText>;
export const H2 = ({ children, style, color }: TP) => <RNText style={[{ fontSize: F.h2, fontWeight: "700", color: color ?? C.text, letterSpacing: -0.3 }, style]}>{children}</RNText>;
export const H3 = ({ children, style, color, numberOfLines }: TP) => <RNText numberOfLines={numberOfLines} style={[{ fontSize: F.h3, fontWeight: "700", color: color ?? C.text }, style]}>{children}</RNText>;
export const T = ({ children, style, color, testID, numberOfLines }: TP) => <RNText testID={testID} numberOfLines={numberOfLines} style={[{ fontSize: F.body, color: color ?? C.text2, lineHeight: 21 }, style]}>{children}</RNText>;
export const Small = ({ children, style, color }: TP) => <RNText style={[{ fontSize: F.small, color: color ?? C.muted, lineHeight: 18 }, style]}>{children}</RNText>;
export const Label = ({ children, style, color }: TP) => <RNText style={[{ fontSize: F.tiny, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase", color: color ?? C.muted }, style]}>{children}</RNText>;

/* ---------- sayfa ---------- */
export function Screen({ children, scroll = true, padded = true, style }: { children: ReactNode; scroll?: boolean; padded?: boolean; style?: StyleProp<ViewStyle> }) {
  const inner = <View style={[padded && { paddingHorizontal: S.lg }, { paddingBottom: S.xxl }, style]}>{children}</View>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{inner}</ScrollView> : <View style={{ flex: 1 }}>{inner}</View>}
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: S.lg, gap: S.md }}>
      {back && (
        <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} style={styles.iconBtn}>
          <Icon name="left" />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        {subtitle && <Small>{subtitle}</Small>}
        <H2>{title}</H2>
      </View>
      {right}
    </View>
  );
}

/* ---------- kart ---------- */
export const Card = ({ children, style, tone }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: string }) => (
  <View style={[styles.card, tone ? { backgroundColor: tone } : null, style]}>{children}</View>
);
export const Row = ({ children, style, gap = S.md }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) => (
  <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>
);
export const Divider = () => <View style={{ height: 1, backgroundColor: C.line, marginVertical: S.md }} />;

/* ---------- düğmeler ---------- */
export function Button({ title, onPress, tone = "accent", icon, disabled, style, small, testID }: { title: string; onPress: () => void; tone?: "accent" | "ghost" | "cyan" | "green" | "danger"; icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean; testID?: string }) {
  const bg = tone === "accent" ? C.accent : tone === "cyan" ? C.cyan : tone === "green" ? C.green : tone === "danger" ? "rgba(244,63,94,0.15)" : C.card2;
  const fg = tone === "ghost" ? C.text : tone === "danger" ? C.accent : tone === "accent" ? C.white : "#0b1220";
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.btn, small && { paddingVertical: 9, paddingHorizontal: 14 }, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}>
      {icon && <Icon name={icon} size={small ? 16 : 18} color={fg} stroke={2.4} />}
      <RNText style={{ color: fg, fontWeight: "700", fontSize: small ? F.small : F.body }}>{title}</RNText>
    </Pressable>
  );
}
export function IconButton({ name, onPress, label, tone, size = 40, color }: { name: IconName; onPress: () => void; label: string; tone?: string; size?: number; color?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconBtn, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone ?? C.card2, opacity: pressed ? 0.7 : 1 }]}>
      <Icon name={name} size={size * 0.5} color={color ?? C.text} stroke={2.4} />
    </Pressable>
  );
}
export function Chip({ label, active, onPress, color = C.accent }: { label: string; active?: boolean; onPress?: () => void; color?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!active }} onPress={onPress} style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}>
      <RNText style={{ color: active ? "#0b1220" : C.text2, fontWeight: "600", fontSize: F.small }}>{label}</RNText>
    </Pressable>
  );
}
export function Stepper({ value, onChange, step = 1, min = 0, max = 999, unit, label, format }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; unit?: string; label: string; format?: (v: number) => string }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, +v.toFixed(2)));
  return (
    <Row gap={S.sm}>
      <IconButton name="minus" label={`${label} azalt`} onPress={() => onChange(clamp(value - step))} size={34} />
      <View style={{ minWidth: 64, alignItems: "center" }}>
        <RNText style={{ color: C.text, fontWeight: "800", fontSize: F.h3, fontVariant: ["tabular-nums"] }}>{format ? format(value) : Number.isInteger(value) ? value : value.toFixed(1).replace(".", ",")}{unit ? <RNText style={{ color: C.muted, fontSize: F.small, fontWeight: "600" }}> {unit}</RNText> : null}</RNText>
      </View>
      <IconButton name="plus" label={`${label} artır`} onPress={() => onChange(clamp(value + step))} size={34} />
    </Row>
  );
}

/* ---------- girişler ---------- */
export function Input(props: TextInputProps & { label?: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      {label && <Label>{label}</Label>}
      <TextInput accessibilityLabel={label ?? rest.placeholder} placeholderTextColor={C.muted} {...rest} style={[styles.input, Platform.OS === "web" && ({ outlineStyle: "none" } as object), style]} />
    </View>
  );
}

/* ---------- göstergeler ---------- */
export function Ring({ value, max, size = 120, stroke = 11, color = C.accent, track = C.card2, children }: { value: number; max: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, pct = Math.min(1, Math.max(0, max ? value / max : 0));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - pct)} />
      </Svg>
      {children}
    </View>
  );
}
export function Bar({ value, max, color = C.accent, height = 8 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = Math.min(100, Math.max(0, max ? (value / max) * 100 : 0));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: C.card2, overflow: "hidden" }}>
      <View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}
export function Stat({ label, value, unit, color, icon }: { label: string; value: string | number; unit?: string; color?: string; icon?: IconName }) {
  return (
    <Card style={{ flex: 1, gap: 6 }}>
      <Row gap={6}>{icon && <Icon name={icon} size={14} color={color ?? C.muted} />}<Label>{label}</Label></Row>
      <RNText style={{ color: color ?? C.text, fontSize: 24, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{value}{unit ? <RNText style={{ color: C.muted, fontSize: F.small, fontWeight: "600" }}> {unit}</RNText> : null}</RNText>
    </Card>
  );
}
export const Empty = ({ icon, title, text }: { icon: IconName; title: string; text: string }) => (
  <Card style={{ alignItems: "center", gap: 6, paddingVertical: S.xl }}>
    <Icon name={icon} size={28} color={C.muted} />
    <H3>{title}</H3>
    <Small style={{ textAlign: "center" }}>{text}</Small>
  </Card>
);

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: S.lg, borderWidth: 1, borderColor: C.line },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 20, borderRadius: R.md },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: C.card },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: F.body },
});

import { memo, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, G, Path, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { LANDMARKS, LINES, PARKS, RIVER, ROADS_MAJOR, ROADS_MINOR, STOPS, USER_LOCATION, linesAtStop, type Line } from "@/data/city";
import { linePath, type Vehicle } from "@/lib/transit";
import { C } from "@/theme";
import { Icon } from "./Icon";

export type ViewBox = { x: number; y: number; w: number };
const toPath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
const riverPath = () => { const p = RIVER; let d = `M${p[0][0]} ${p[0][1]}`; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i]; d += ` C${x0} ${(y0 + y1) / 2} ${x1} ${(y0 + y1) / 2} ${x1} ${y1}`; } return d; };

/** Şematik şehir haritası: nehir, parklar, caddeler, hatlar, duraklar, canlı araçlar. Sürükle-kaydır + yakınlaştır. */
export const TransitMap = memo(function TransitMap({ vehicles, selectedStop, onSelectStop, highlightLines, initial, lowData, showUser = true, height, controlsBottom = 12, controlsTop }: { vehicles: Vehicle[]; selectedStop?: string | null; onSelectStop?: (id: string) => void; highlightLines?: string[]; initial?: ViewBox; lowData?: boolean; showUser?: boolean; height?: number; controlsBottom?: number; controlsTop?: number }) {
  const [vb, setVb] = useState<ViewBox>(initial ?? { x: 250, y: 300, w: 560 });
  const [size, setSize] = useState({ w: 390, h: 500 });
  const vbRef = useRef(vb); vbRef.current = vb;
  const sizeRef = useRef(size); sizeRef.current = size;
  const startRef = useRef<ViewBox | null>(null);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 4,
    onPanResponderGrant: () => { startRef.current = vbRef.current; },
    onPanResponderMove: (_, g) => { const s = startRef.current; if (!s) return; const k = s.w / sizeRef.current.w; setVb({ x: s.x - g.dx * k, y: s.y - g.dy * k, w: s.w }); },
  }), []);
  const aspect = size.h / size.w, h = vb.w * aspect;
  const zoom = (f: number) => setVb((v) => { const w = Math.max(220, Math.min(1400, v.w * f)); const cx = v.x + v.w / 2, cy = v.y + (v.w * aspect) / 2; return { x: cx - w / 2, y: cy - (w * aspect) / 2, w }; });
  const k = vb.w / 880; // ölçek: 1 = varsayılan görünüm
  const showLabels = vb.w < 700, showMinor = vb.w < 1000;
  const lines: Line[] = highlightLines?.length ? LINES.filter((l) => highlightLines.includes(l.id)) : LINES;
  const dimmed = (id: string) => highlightLines?.length && !highlightLines.includes(id);
  const paths = useMemo(() => LINES.map((l) => ({ l, d: linePath(l).pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ") })), []);
  const stopLines = useMemo(() => Object.fromEntries(STOPS.map((s) => [s.id, linesAtStop(s.id)])), []);
  return (
    <View onLayout={(e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={{ flex: height ? undefined : 1, height, backgroundColor: C.map.land, overflow: "hidden" }} {...pan.panHandlers} accessibilityLabel="Toplu taşıma haritası" accessible>
      {size.w > 0 && (
        <Svg width="100%" height="100%" viewBox={`${vb.x} ${vb.y} ${vb.w} ${h}`}>
          <Rect x={-2000} y={-2000} width={5000} height={5000} fill={C.map.land} />
          {!lowData && PARKS.map((p, i) => <Rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r ?? 20} fill={C.map.park} />)}
          <Path d={riverPath()} stroke={C.map.water} strokeWidth={34} fill="none" strokeLinecap="round" />
          {showMinor && ROADS_MINOR.map((r, i) => <Path key={`mi${i}`} d={toPath(r)} stroke={C.map.road} strokeWidth={5} />)}
          {ROADS_MAJOR.map((r, i) => <Path key={`ma${i}`} d={toPath(r)} stroke={C.map.roadMajor} strokeWidth={10} />)}
          {!lowData && LANDMARKS.map((l) => <SvgText key={l.name} x={l.x} y={l.y} fill={C.map.label} fontSize={13 * k} fontStyle="italic" textAnchor="middle">{l.name}</SvgText>)}
          {/* hatlar */}
          {paths.map(({ l, d }) => <Path key={l.id} d={d} stroke={l.color} strokeWidth={(l.kind === "tram" ? 9 : 7) * k} strokeOpacity={dimmed(l.id) ? 0.18 : 0.95} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={l.kind === "tram" ? undefined : undefined} />)}
          {/* duraklar */}
          {STOPS.map((s) => { const n = stopLines[s.id].length, sel = s.id === selectedStop, dim = highlightLines?.length && !stopLines[s.id].some((l) => highlightLines.includes(l.id)); const r = (n > 1 ? 7 : 5) * k; return (
            <G key={s.id} opacity={dim ? 0.25 : 1} onPress={() => onSelectStop?.(s.id)}>
              {sel && <Circle cx={s.x} cy={s.y} r={r * 2.6} fill={C.accent} fillOpacity={0.25} />}
              <Circle cx={s.x} cy={s.y} r={r} fill={sel ? C.accent : "#ffffff"} stroke={sel ? "#ffffff" : C.map.land} strokeWidth={2.5 * k} />
              {(showLabels || n > 1 || sel) && <><SvgText x={s.x} y={s.y - r - 5 * k} fontSize={(sel ? 14 : 11.5) * k} fontWeight={sel ? "700" : "600"} textAnchor="middle" stroke={C.map.land} strokeWidth={4 * k} fill={C.map.land}>{s.name}</SvgText><SvgText x={s.x} y={s.y - r - 5 * k} fill={sel ? "#fff" : "#d5deef"} fontSize={(sel ? 14 : 11.5) * k} fontWeight={sel ? "700" : "600"} textAnchor="middle">{s.name}</SvgText></>}
            </G>); })}
          {/* araçlar */}
          {vehicles.filter((v) => lines.some((l) => l.id === v.lineId)).map((v) => { const l = LINES.find((x) => x.id === v.lineId)!; const w = (l.id.length > 2 ? 34 : 28) * k, hh = 16 * k; return (
            <G key={v.id} transform={`translate(${v.x} ${v.y}) rotate(${((v.angle % 360) + 450) % 180 - 90})`}>
              <Rect x={-w / 2} y={-hh / 2} width={w} height={hh} rx={hh / 2} fill={l.color} stroke="#fff" strokeWidth={1.5 * k} />
              <SvgText x={0} y={4.2 * k} fill="#fff" fontSize={10.5 * k} fontWeight="800" textAnchor="middle">{l.id}</SvgText>
            </G>); })}
          {showUser && <G><Circle cx={USER_LOCATION.x} cy={USER_LOCATION.y} r={16 * k} fill={C.accent} fillOpacity={0.2} /><Circle cx={USER_LOCATION.x} cy={USER_LOCATION.y} r={6 * k} fill={C.accent} stroke="#fff" strokeWidth={2 * k} /></G>}
        </Svg>
      )}
      <View style={{ position: "absolute", right: 12, ...(controlsTop != null ? { top: controlsTop } : { bottom: controlsBottom }), gap: 8 }}>
        {[["+", 0.75, "Yakınlaştır"], ["−", 1.33, "Uzaklaştır"]].map(([t, f, l]) => <Pressable key={String(t)} accessibilityRole="button" accessibilityLabel={String(l)} onPress={() => zoom(Number(f))} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" }}><SvgLabel t={String(t)} /></Pressable>)}
        {showUser && <Pressable accessibilityRole="button" accessibilityLabel="Konumuma git" onPress={() => setVb({ x: USER_LOCATION.x - 200, y: USER_LOCATION.y - 200 * aspect, w: 400 })} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" }}><Icon name="locate" size={20} color={C.accent} /></Pressable>}
      </View>
    </View>
  );
});
const SvgLabel = ({ t }: { t: string }) => <Svg width={20} height={20} viewBox="0 0 20 20"><SvgText x={10} y={15} fill={C.text} fontSize={18} fontWeight="700" textAnchor="middle">{t}</SvgText></Svg>;

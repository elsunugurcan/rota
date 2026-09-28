import { LINES, STOPS, lineById, stopById, type Line, type Stop } from "@/data/city";

export const UNIT_M = 10; // 1 tuval birimi = 10 m
export const DWELL_S = 20; // durakta bekleme
export const WALK_MS = 1.25; // yürüme hızı m/s

export type Pt = { x: number; y: number };
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Hattın gidiş yolu: duraklar + ara noktalar; kümülatif mesafe ve her durağın yol üzerindeki konumu */
export type Path = { pts: Pt[]; cum: number[]; length: number; stopAt: number[] };
const pathCache = new Map<string, Path>();
export function linePath(line: Line): Path {
  if (pathCache.has(line.id)) return pathCache.get(line.id)!;
  const pts: Pt[] = [], stopAt: number[] = [];
  line.stops.forEach((sid, i) => {
    const st = stopById(sid);
    if (i > 0) { const wp = line.waypoints?.[`${line.stops[i - 1]}>${sid}`] ?? []; for (const [x, y] of wp) pts.push({ x, y }); }
    stopAt.push(pts.length); pts.push({ x: st.x, y: st.y });
  });
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
  const p = { pts, cum, length: cum[cum.length - 1], stopAt: stopAt.map((i) => cum[i]) };
  pathCache.set(line.id, p); return p;
}
/** Yol üzerinde d mesafesindeki nokta ve yön açısı */
export function pointAt(path: Path, d: number): Pt & { angle: number } {
  const dd = Math.max(0, Math.min(path.length, d));
  let i = 1; while (i < path.cum.length - 1 && path.cum[i] < dd) i++;
  const a = path.pts[i - 1], b = path.pts[i], seg = path.cum[i] - path.cum[i - 1] || 1, t = (dd - path.cum[i - 1]) / seg;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
}
export const speedUps = (line: Line) => (line.speedKmh * 1000) / 3600 / UNIT_M; // birim/sn
/** Tek yön seyahat süresi (sn): yol + her ara durakta bekleme */
export const oneWaySec = (line: Line) => linePath(line).length / speedUps(line) + (line.stops.length - 1) * DWELL_S;

export type Vehicle = { id: string; lineId: string; dir: 0 | 1; progress: number; d: number; x: number; y: number; angle: number; nextStopIdx: number; occupancy: "az" | "orta" | "dolu" };
/** Zamanın saf fonksiyonu olarak araç konumları (gerçek zamanlı akışın simülasyonu) */
export function vehiclesAt(t: number, lines: Line[] = LINES): Vehicle[] {
  const out: Vehicle[] = [];
  for (const line of lines) {
    const path = linePath(line), one = oneWaySec(line), cycle = 2 * one;
    for (let i = 0; i < line.vehicles; i++) {
      const s = (((t / cycle) + i / line.vehicles) % 1 + 1) % 1;
      const dir: 0 | 1 = s < 0.5 ? 0 : 1, frac = dir === 0 ? s * 2 : (s - 0.5) * 2;
      // duraklarda bekleme: ilerlemeyi mesafeye çevirirken bekleme paylarını çıkar
      const travel = frac * one; let d = 0, remaining = travel;
      for (let k = 1; k < line.stops.length; k++) {
        const segLen = path.stopAt[k] - path.stopAt[k - 1], segT = segLen / speedUps(line);
        if (remaining <= segT) { d = path.stopAt[k - 1] + remaining * speedUps(line); remaining = -1; break; }
        remaining -= segT; if (remaining <= DWELL_S) { d = path.stopAt[k]; remaining = -1; break; }
        remaining -= DWELL_S; d = path.stopAt[k];
      }
      if (remaining >= 0) d = path.length;
      const dd = dir === 0 ? d : path.length - d;
      const p = pointAt(path, dd);
      const nextStopIdx = dir === 0 ? path.stopAt.findIndex((a) => a > dd + 0.01) : path.stopAt.length - 1 - [...path.stopAt].reverse().findIndex((a) => a < dd - 0.01);
      const occ = (["az", "orta", "dolu", "orta", "az"] as const)[(i + Math.floor(t / 600)) % 5];
      out.push({ id: `${line.id}-${i + 1}`, lineId: line.id, dir, progress: frac, d: dd, x: p.x, y: p.y, angle: dir === 1 ? p.angle + 180 : p.angle, nextStopIdx: Math.max(0, Math.min(line.stops.length - 1, nextStopIdx === -1 ? line.stops.length - 1 : nextStopIdx)), occupancy: occ });
    }
  }
  return out;
}

export type Arrival = { lineId: string; vehicleId: string; dir: 0 | 1; headsign: string; etaSec: number; stopsAway: number; occupancy: Vehicle["occupancy"]; scheduled?: boolean };
/** Bir durağa yaklaşan araçlar (her yön için) */
export function arrivalsAt(stopId: string, t: number, limitPerLine = 3): Arrival[] {
  const out: Arrival[] = [];
  for (const line of LINES) {
    const idx = line.stops.indexOf(stopId); if (idx < 0) continue;
    const path = linePath(line), v = speedUps(line);
    const vehicles = vehiclesAt(t, [line]);
    for (const dir of [0, 1] as const) {
      const last = dir === 0 ? line.stops.length - 1 : 0;
      if (idx === last) continue; // son durak: bu yönde biniş yok
      const stopD = dir === 0 ? path.stopAt[idx] : path.length - path.stopAt[idx];
      const list: Arrival[] = [];
      for (const veh of vehicles) {
        if (veh.dir !== dir || veh.d > stopD + 0.5) continue;
        const remain = stopD - veh.d;
        const stopsBetween = dir === 0 ? path.stopAt.filter((a) => a > veh.d + 0.5 && a < stopD - 0.5).length : path.stopAt.filter((a) => path.length - a > veh.d + 0.5 && path.length - a < stopD - 0.5).length;
        list.push({ lineId: line.id, vehicleId: veh.id, dir, headsign: stopById(line.stops[last]).name, etaSec: Math.round(remain / v + stopsBetween * DWELL_S), stopsAway: stopsBetween + 1, occupancy: veh.occupancy });
      }
      list.sort((a, b) => a.etaSec - b.etaSec);
      // yeterli araç yoksa tarifeye göre tahmin ekle
      let k = list.length, base = list.length ? list[list.length - 1].etaSec : line.headwayMin * 30;
      while (k < limitPerLine) { base += line.headwayMin * 60; list.push({ lineId: line.id, vehicleId: `${line.id}-plan`, dir, headsign: stopById(line.stops[last]).name, etaSec: base, stopsAway: 0, occupancy: "az", scheduled: true }); k++; }
      out.push(...list.slice(0, limitPerLine));
    }
  }
  return out.sort((a, b) => a.etaSec - b.etaSec);
}

/* ---------------- Rota planlama (Dijkstra, aktarma cezalı) ---------------- */
export type Leg = { kind: "walk"; from: Pt & { name: string }; to: Stop; sec: number; meters: number } | { kind: "ride"; lineId: string; from: string; to: string; stops: string[]; sec: number; waitSec: number } | { kind: "walkEnd"; from: Stop; to: Pt & { name: string }; sec: number; meters: number };
export type Plan = { legs: Leg[]; totalSec: number; transfers: number; walkMeters: number; fare: number };
const TRANSFER_PENALTY = 90;
export const FARE = 15, TRANSFER_FARE = 5;

type Edge = { to: string; sec: number; lineId?: string; stopsPassed?: string[] };
function buildGraph() {
  const adj = new Map<string, Edge[]>();
  const add = (a: string, e: Edge) => { if (!adj.has(a)) adj.set(a, []); adj.get(a)!.push(e); };
  for (const line of LINES) {
    const path = linePath(line), v = speedUps(line);
    for (let i = 0; i < line.stops.length; i++) {
      const sid = line.stops[i], node = `${sid}|${line.id}`;
      add(`${sid}|-`, { to: node, sec: (line.headwayMin * 60) / 2 }); // biniş: beklenen bekleme
      add(node, { to: `${sid}|-`, sec: TRANSFER_PENALTY }); // iniş / aktarma cezası
      for (const j of [i - 1, i + 1]) if (j >= 0 && j < line.stops.length) add(node, { to: `${line.stops[j]}|${line.id}`, sec: Math.abs(path.stopAt[j] - path.stopAt[i]) / v + DWELL_S, lineId: line.id });
    }
  }
  return adj;
}
let graph: Map<string, Edge[]> | null = null;
export function planRoute(fromStop: string, toStop: string): Plan | null {
  if (fromStop === toStop) return null;
  graph ??= buildGraph();
  const start = `${fromStop}|-`, goal = `${toStop}|-`;
  const best = new Map<string, number>([[start, 0]]), prev = new Map<string, { node: string; edge: Edge }>();
  const open = new Set<string>([start]);
  while (open.size) {
    let cur = "", cd = Infinity; for (const n of open) { const d = best.get(n)!; if (d < cd) { cd = d; cur = n; } }
    open.delete(cur); if (cur === goal) break;
    for (const e of graph.get(cur) ?? []) { const nd = cd + e.sec; if (nd < (best.get(e.to) ?? Infinity)) { best.set(e.to, nd); prev.set(e.to, { node: cur, edge: e }); open.add(e.to); } }
  }
  if (!best.has(goal)) return null;
  // yolu geri sar, ride bacaklarını birleştir
  const chain: { node: string; edge: Edge }[] = []; let n = goal;
  while (n !== start) { const p = prev.get(n)!; chain.unshift({ node: n, edge: p.edge }); n = p.node; }
  const legs: Leg[] = []; let cur: (Leg & { kind: "ride" }) | null = null;
  for (const step of chain) {
    const [sid, lid] = step.node.split("|");
    if (step.edge.lineId) { if (cur && cur.lineId === lid) { cur.stops.push(sid); cur.to = sid; cur.sec += step.edge.sec; } }
    else if (lid !== "-") { cur = { kind: "ride", lineId: lid, from: sid, to: sid, stops: [sid], sec: 0, waitSec: step.edge.sec }; legs.push(cur); }
    else cur = null;
  }
  const rides = legs.filter((l): l is Leg & { kind: "ride" } => l.kind === "ride");
  const totalSec = rides.reduce((a, l) => a + l.sec + l.waitSec, 0) + Math.max(0, rides.length - 1) * TRANSFER_PENALTY;
  return { legs: rides, totalSec, transfers: Math.max(0, rides.length - 1), walkMeters: 0, fare: FARE + Math.max(0, rides.length - 1) * TRANSFER_FARE };
}
/** Konumdan en yakın duraklar */
export const nearestStops = (p: Pt, n = 3) => [...STOPS].map((s) => ({ stop: s, meters: Math.round(dist(p, s) * UNIT_M) })).sort((a, b) => a.meters - b.meters).slice(0, n);
export const walkSec = (meters: number) => Math.round(meters / WALK_MS);
/** Konumdan durağa: en yakın 3 duraktan en iyi toplam planı seç */
export function planFromPoint(origin: Pt & { name: string }, toStop: string): Plan | null {
  let bestPlan: Plan | null = null;
  for (const { stop, meters } of nearestStops(origin, 3)) {
    const w = walkSec(meters);
    if (stop.id === toStop) { const p: Plan = { legs: [{ kind: "walk", from: origin, to: stop, sec: w, meters }], totalSec: w, transfers: 0, walkMeters: meters, fare: 0 }; if (!bestPlan || p.totalSec < bestPlan.totalSec) bestPlan = p; continue; }
    const p = planRoute(stop.id, toStop); if (!p) continue;
    const full: Plan = { ...p, legs: [{ kind: "walk", from: origin, to: stop, sec: w, meters }, ...p.legs], totalSec: p.totalSec + w, walkMeters: meters };
    if (!bestPlan || full.totalSec < bestPlan.totalSec) bestPlan = full;
  }
  return bestPlan;
}

export const fmtMin = (sec: number) => { const m = Math.round(sec / 60); return m <= 0 ? "Şimdi" : `${m} dk`; };
export const fmtClock = (d: Date) => d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
export const fmtMeters = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1).replace(".", ",")} km` : `${m} m`);
export const lineColor = (id: string) => lineById(id).color;
export const foldTr = (s: string) => s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
export const searchStops = (q: string) => { const f = foldTr(q.trim()); if (!f) return STOPS; return STOPS.filter((s) => foldTr(s.name).includes(f) || foldTr(s.zone).includes(f)); };

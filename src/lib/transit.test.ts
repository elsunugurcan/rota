import { describe, expect, it } from "vitest";
import { LINES, STOPS, lineById, stopById } from "@/data/city";
import { arrivalsAt, foldTr, linePath, nearestStops, oneWaySec, planFromPoint, planRoute, pointAt, searchStops, vehiclesAt, walkSec } from "./transit";

describe("veri bütünlüğü", () => {
  it("hatların tüm durakları tanımlı", () => { for (const l of LINES) for (const s of l.stops) expect(stopById(s), `${l.id}:${s}`).toBeDefined(); });
  it("durak adları benzersiz", () => { expect(new Set(STOPS.map((s) => s.name)).size).toBe(STOPS.length); });
});
describe("geometri", () => {
  it("yol uzunluğu ve durak konumları artan", () => { const p = linePath(lineById("T1")); expect(p.length).toBeGreaterThan(700); for (let i = 1; i < p.stopAt.length; i++) expect(p.stopAt[i]).toBeGreaterThan(p.stopAt[i - 1]); });
  it("pointAt uç noktalar", () => { const p = linePath(lineById("101")); expect(pointAt(p, 0)).toMatchObject({ x: 260, y: 100 }); expect(pointAt(p, p.length)).toMatchObject({ x: 260, y: 800 }); });
  it("T1 tek yön süresi makul (dk)", () => { const m = oneWaySec(lineById("T1")) / 60; expect(m).toBeGreaterThan(12); expect(m).toBeLessThan(25); });
});
describe("araç simülasyonu", () => {
  it("her hat için araç sayısı ve konumlar hat üzerinde", () => {
    const v = vehiclesAt(1000);
    expect(v.length).toBe(LINES.reduce((a, l) => a + l.vehicles, 0));
    for (const veh of v) { const p = linePath(lineById(veh.lineId)); expect(veh.d).toBeGreaterThanOrEqual(0); expect(veh.d).toBeLessThanOrEqual(p.length + 0.001); expect(Number.isFinite(veh.x)).toBe(true); }
  });
  it("zaman ilerleyince araçlar hareket eder ve deterministiktir", () => {
    const a = vehiclesAt(5000), b = vehiclesAt(5030), a2 = vehiclesAt(5000);
    expect(a).toEqual(a2); expect(a.some((v, i) => v.x !== b[i].x || v.y !== b[i].y)).toBe(true);
  });
});
describe("varış tahmini", () => {
  it("Merkez Meydan'a 12 ve 7 hatları geliyor, sıralı", () => {
    const arr = arrivalsAt("merkez-meydan", 4000);
    expect(new Set(arr.map((a) => a.lineId))).toEqual(new Set(["12", "7"]));
    for (let i = 1; i < arr.length; i++) expect(arr[i].etaSec).toBeGreaterThanOrEqual(arr[i - 1].etaSec);
    expect(arr.some((a) => !a.scheduled)).toBe(true);
  });
  it("son durakta o yöne biniş yok", () => { const arr = arrivalsAt("universite", 4000); expect(arr.every((a) => a.headsign === "Havalimanı Yolu")).toBe(true); });
});
describe("rota planlama", () => {
  it("aktarmasız: Üniversite → Fuar Alanı (101)", () => { const p = planRoute("universite", "fuar-alani")!; expect(p.transfers).toBe(0); expect(p.legs[0]).toMatchObject({ kind: "ride", lineId: "101", from: "universite", to: "fuar-alani" }); expect(p.fare).toBe(15); });
  it("aktarmalı: Üniversite → Havalimanı (101 → T1 → 33)", () => { const p = planRoute("universite", "havalimani")!; expect(p.transfers).toBe(2); expect(p.legs.map((l) => (l as { lineId: string }).lineId)).toEqual(["101", "T1", "33"]); expect(p.fare).toBe(25); expect(p.totalSec / 60).toBeLessThan(90); });
  it("aynı durak → null", () => expect(planRoute("adliye", "adliye")).toBeNull());
  it("konumdan plan yürüme bacağıyla başlar", () => { const p = planFromPoint({ x: 588, y: 470, name: "Konumum" }, "sehir-hastanesi")!; expect(p.legs[0].kind).toBe("walk"); expect(p.walkMeters).toBeGreaterThan(0); expect(p.walkMeters).toBeLessThan(600); });
});
describe("yardımcılar", () => {
  it("en yakın duraklar", () => { expect(nearestStops({ x: 588, y: 470 }, 1)[0].stop.id).toBe("merkez-meydan"); });
  it("yürüme süresi", () => expect(walkSec(300)).toBe(240));
  it("Türkçe arama", () => { expect(foldTr("ŞEHİR")).toBe("sehir"); expect(searchStops("sehir").map((s) => s.id)).toContain("sehir-hastanesi"); expect(searchStops("cami")[0].name).toBe("Ulu Cami"); });
});

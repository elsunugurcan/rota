/** Kurgusal bir sahil kentinin toplu taşıma ağı. Koordinatlar 1000×1000 tuval; 1 birim = 10 m. */
export type Stop = { id: string; name: string; x: number; y: number; zone: string; accessible?: boolean };
export type LineKind = "bus" | "tram";
export type Line = { id: string; name: string; kind: LineKind; color: string; stops: string[]; waypoints?: Record<string, [number, number][]>; headwayMin: number; speedKmh: number; first: string; last: string; vehicles: number };
export type Alert = { id: string; lineId?: string; title: string; text: string; from: string; to: string; severity: "bilgi" | "uyari" };

const s = (id: string, name: string, x: number, y: number, zone: string, accessible = true): Stop => ({ id, name, x, y, zone, accessible });
export const STOPS: Stop[] = [
  s("universite", "Üniversite", 260, 100, "Kuzey"), s("teknopark", "Teknopark", 420, 100, "Kuzey"), s("sehir-hastanesi", "Şehir Hastanesi", 700, 100, "Kuzey"),
  s("kampus-kapisi", "Kampüs Kapısı", 260, 200, "Kuzey"), s("kultur-merkezi", "Kültür Merkezi", 420, 200, "Kuzey"), s("saglik-ocagi", "Sağlık Ocağı", 560, 200, "Kuzey"), s("hastane-yolu", "Hastane Yolu", 700, 200, "Kuzey"), s("bahcelievler", "Bahçelievler", 860, 200, "Doğu"),
  s("belediye", "Belediye", 260, 320, "Merkez"), s("valilik", "Valilik", 420, 320, "Merkez"), s("kutuphane", "Kütüphane", 560, 320, "Merkez"), s("park-caddesi", "Park Caddesi", 700, 320, "Merkez"), s("botanik-park", "Botanik Park", 860, 320, "Doğu"),
  s("sanayi", "Sanayi", 120, 440, "Batı"), s("fuar-alani", "Fuar Alanı", 260, 440, "Batı"), s("adliye", "Adliye", 420, 440, "Merkez"), s("merkez-meydan", "Merkez Meydan", 560, 440, "Merkez"), s("carsi", "Çarşı", 700, 440, "Merkez", false), s("tren-gari", "Tren Garı", 860, 440, "Doğu"),
  s("otogar", "Otogar", 120, 560, "Batı"), s("organize-sanayi", "Organize Sanayi", 260, 560, "Batı"), s("cami", "Ulu Cami", 420, 560, "Merkez", false), s("vapur-iskelesi", "Vapur İskelesi", 560, 560, "Merkez"), s("balikcilar", "Balıkçılar", 700, 560, "Sahil"), s("stadyum", "Stadyum", 860, 560, "Doğu"),
  s("toptancilar", "Toptancılar", 120, 680, "Batı"), s("mahalle-pazari", "Mahalle Pazarı", 260, 680, "Batı", false), s("devlet-hastanesi", "Devlet Hastanesi", 420, 680, "Güney"), s("marina", "Marina", 560, 680, "Sahil"), s("muze", "Müze", 700, 680, "Sahil"), s("kongre-merkezi", "Kongre Merkezi", 860, 680, "Doğu"),
  s("havalimani-yolu", "Havalimanı Yolu", 260, 800, "Güney"), s("yeni-mahalle", "Yeni Mahalle", 420, 800, "Güney"), s("deniz-feneri", "Deniz Feneri", 560, 800, "Sahil"), s("liman", "Liman", 700, 800, "Sahil"), s("havalimani", "Havalimanı", 900, 860, "Doğu"),
];

export const LINES: Line[] = [
  { id: "T1", name: "Otogar – Tren Garı Tramvayı", kind: "tram", color: "#ef4444", headwayMin: 6, speedKmh: 30, first: "05:30", last: "00:30", vehicles: 6,
    stops: ["otogar", "organize-sanayi", "cami", "vapur-iskelesi", "balikcilar", "stadyum", "tren-gari"], waypoints: { "balikcilar>stadyum": [[780, 560]], "stadyum>tren-gari": [[880, 520]] } },
  { id: "101", name: "Üniversite – Havalimanı Yolu", kind: "bus", color: "#3b82f6", headwayMin: 8, speedKmh: 22, first: "06:00", last: "23:30", vehicles: 5,
    stops: ["universite", "kampus-kapisi", "belediye", "fuar-alani", "organize-sanayi", "mahalle-pazari", "havalimani-yolu"] },
  { id: "12", name: "Çarşı Ring", kind: "bus", color: "#22c55e", headwayMin: 10, speedKmh: 18, first: "06:30", last: "22:30", vehicles: 3,
    stops: ["adliye", "merkez-meydan", "carsi", "park-caddesi", "kutuphane", "valilik"] },
  { id: "7", name: "Sanayi – Şehir Hastanesi", kind: "bus", color: "#f59e0b", headwayMin: 9, speedKmh: 24, first: "05:45", last: "23:45", vehicles: 5,
    stops: ["sanayi", "fuar-alani", "adliye", "merkez-meydan", "kutuphane", "saglik-ocagi", "hastane-yolu", "sehir-hastanesi"], waypoints: { "saglik-ocagi>hastane-yolu": [[630, 180]] } },
  { id: "33", name: "Havalimanı Ekspres", kind: "bus", color: "#a855f7", headwayMin: 15, speedKmh: 32, first: "04:30", last: "01:00", vehicles: 4,
    stops: ["bahcelievler", "botanik-park", "tren-gari", "stadyum", "kongre-merkezi", "havalimani"], waypoints: { "kongre-merkezi>havalimani": [[880, 780]] } },
  { id: "51", name: "Ulu Cami – Balıkçılar (Liman)", kind: "bus", color: "#06b6d4", headwayMin: 12, speedKmh: 20, first: "06:00", last: "23:00", vehicles: 4,
    stops: ["cami", "devlet-hastanesi", "yeni-mahalle", "deniz-feneri", "liman", "muze", "balikcilar"] },
  { id: "22", name: "Teknopark – Devlet Hastanesi", kind: "bus", color: "#ec4899", headwayMin: 10, speedKmh: 22, first: "06:15", last: "23:15", vehicles: 4,
    stops: ["teknopark", "kultur-merkezi", "valilik", "adliye", "cami", "devlet-hastanesi"] },
];

export const ALERTS: Alert[] = [
  { id: "a1", lineId: "12", title: "Çarşı durağı geçici olarak kapalı", text: "Yol yenileme çalışması nedeniyle 12 Ring hattı Çarşı durağına uğramayacak; yolcular Park Caddesi durağını kullanabilir.", from: "2026-09-25", to: "2026-10-05", severity: "uyari" },
  { id: "a2", lineId: "T1", title: "Hafta sonu ek seferler", text: "Stadyum maçları nedeniyle Cumartesi 18:00–23:00 arasında T1 tramvayı 4 dakika aralıkla çalışacak.", from: "2026-09-26", to: "2026-09-27", severity: "bilgi" },
  { id: "a3", title: "Kentkart bakiye yükleme kampanyası", text: "Uygulamadan yapılan 200 ₺ ve üzeri yüklemelerde 10 ₺ hediye bakiye.", from: "2026-09-01", to: "2026-10-31", severity: "bilgi" },
];

/** Harita dekorasyonu: nehir, parklar, ana caddeler */
export const RIVER: [number, number][] = [[640, 0], [636, 120], [650, 260], [640, 400], [628, 520], [642, 660], [655, 800], [645, 1000]];
export const PARKS: { x: number; y: number; w: number; h: number; r?: number }[] = [{ x: 790, y: 270, w: 140, h: 100, r: 30 }, { x: 470, y: 590, w: 120, h: 70, r: 24 }, { x: 180, y: 40, w: 160, h: 110, r: 40 }, { x: 60, y: 760, w: 140, h: 120, r: 30 }];
export const ROADS_MAJOR: [number, number][][] = [[[0, 440], [1000, 440]], [[0, 560], [1000, 560]], [[260, 0], [260, 1000]], [[420, 0], [420, 1000]], [[860, 0], [860, 1000]], [[700, 0], [700, 1000]]];
export const ROADS_MINOR: [number, number][][] = [[[0, 200], [1000, 200]], [[0, 320], [1000, 320]], [[0, 680], [1000, 680]], [[0, 800], [1000, 800]], [[120, 0], [120, 1000]], [[560, 0], [560, 1000]], [[0, 100], [1000, 100]]];
export const LANDMARKS: { name: string; x: number; y: number }[] = [{ name: "Kampüs", x: 300, y: 60 }, { name: "Botanik Park", x: 860, y: 300 }, { name: "Sahil Parkı", x: 530, y: 610 }, { name: "Seyhan Nehri", x: 660, y: 720 }, { name: "Havalimanı", x: 930, y: 900 }];
export const USER_LOCATION = { x: 588, y: 470 }; // Merkez Meydan yakını

export const stopById = (id: string) => STOPS.find((s) => s.id === id)!;
export const lineById = (id: string) => LINES.find((l) => l.id === id)!;
export const linesAtStop = (stopId: string) => LINES.filter((l) => l.stops.includes(stopId));

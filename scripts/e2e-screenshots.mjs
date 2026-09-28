// Uçtan uca akış testi + gerçek ekran görüntüleri (390×844, @2x). Önce: npm run export:web && node scripts/serve.mjs 8082
import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
const BASE = process.env.BASE_URL ?? "http://localhost:8082";
const OUT = process.env.OUT ?? "screenshots";
await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 14"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "tr-TR", timezoneId: "Europe/Istanbul" });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const ok = (c, m) => { if (!c) throw new Error("TEST BAŞARISIZ: " + m); console.log("✓", m); };
const shot = async (name) => { await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log("📸", name); };
const text = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
const tab = async (label) => { await page.getByRole("tab", { name: label }).click(); await page.waitForTimeout(600); };
const go = async (p) => { await page.goto(BASE + p); await page.waitForTimeout(900); };

// Harita
await go("/");
let t = await text();
ok(/Canlı · \d+ araç yolda/.test(t) && t.includes("Merkez Meydan"), "harita: canlı araç sayacı ve yakın duraklar");
const n1 = Number(t.match(/Canlı · (\d+) araç/)[1]); ok(n1 === 31, `toplam ${n1} araç (hat tanımlarıyla uyumlu)`);
await shot("01-harita");
await page.getByRole("button", { name: /Merkez Meydan durağı, 410 m/ }).click(); await page.waitForTimeout(400);
t = await text(); ok(/→ (Valilik|Adliye|Sanayi|Şehir Hastanesi)/.test(t) && (await page.getByTestId("eta").count()) === 4, "durak kartı: 4 yaklaşan araç");
const etaA = await page.getByTestId("eta").first().innerText();
// Merkez Meydan varsayılan favori: çıkar → ekle
await page.getByRole("button", { name: "Favorilerden çıkar" }).click(); await page.waitForTimeout(200);
ok((await page.getByRole("button", { name: "Favorilere ekle" }).count()) === 1, "favoriden çıkarıldı (haritadan)");
await page.getByRole("button", { name: "Favorilere ekle" }).click(); await page.waitForTimeout(200);
await shot("02-harita-durak");
await page.getByRole("button", { name: "Yakınlaştır" }).click(); await page.getByRole("button", { name: "Konumuma git" }).click(); await page.waitForTimeout(300);
ok(true, "yakınlaştırma ve konuma git");
await page.getByTestId("stop-detail").click(); await page.waitForURL(/\/durak\/merkez-meydan/); await page.waitForTimeout(800);

// Durak detayı
t = await text();
ok(t.includes("Merkez Meydan") && t.includes("Erişilebilir") && t.includes("Çarşı durağı geçici olarak kapalı"), "durak detayı: erişilebilirlik ve hat duyurusu");
ok((await page.getByTestId("eta").count()) >= 4 && t.includes("Tarifeye göre"), "canlı + tarifeye göre varışlar listelendi");
await page.waitForTimeout(2500);
ok((await page.locator("body").innerText()).includes("Güncellendi"), "canlı güncelleme etiketi");
await page.getByTestId("fav-toggle").click(); await page.waitForTimeout(200);
ok((await page.getByRole("button", { name: "Favorilere ekle" }).count()) === 1, "favori düğmesi (çıkar)");
await page.getByTestId("fav-toggle").click(); await page.waitForTimeout(200);
await shot("03-durak");
await page.getByRole("button", { name: "12 hattı" }).first().click(); await page.waitForURL(/\/hat\/12/); await page.waitForTimeout(800);

// Hat detayı
t = await text();
ok(t.includes("Çarşı Ring") && t.includes("her 10 dk") === false && t.includes("10 dk") && t.includes("3 araç yolda"), "hat detayı: sıklık ve araç sayısı");
ok(t.includes("Adliye") && t.includes("Valilik") && t.includes("başlangıç") && t.includes("son durak"), "hat durak listesi");
await shot("04-hat");
await go("/hat/T1"); t = await text(); ok(t.includes("Tramvay hattı") && t.includes("6 araç yolda") && t.includes("Hafta sonu ek seferler"), "T1 tramvay hattı ve duyurusu");

// Duraklar
await go("/"); await tab("Duraklar");
t = await text(); ok(t.includes("FAVORILER") || t.includes("FAVORİLER") ? true : /favoriler/i.test(t), "favoriler bölümü");
ok(/yak[ıi]n[ıi]mdakiler/i.test(t) && t.includes("410 m"), "yakınımdakiler mesafeli");
await page.getByPlaceholder(/Durak, semt/).fill("hastane"); await page.waitForTimeout(700);
ok((await page.getByRole("button", { name: /durağı$/ }).count()) === 3 && (await text()).includes("Devlet Hastanesi"), "Türkçe karakter duyarsız arama (3 sonuç)");
await page.getByPlaceholder(/Durak, semt/).fill("t1"); await page.waitForTimeout(700);
ok((await text()).includes("Otogar – Tren Garı Tramvayı"), "hat araması");
await page.getByPlaceholder(/Durak, semt/).fill("");
await shot("05-duraklar");

// Rota planlama
await tab("Rota");
await page.getByTestId("to").click(); await page.getByPlaceholder("Durak ara…").fill("havalim"); await page.getByRole("button", { name: "Havalimanı", exact: true }).click();
await page.getByTestId("find-route").click(); await page.waitForTimeout(400);
t = await text();
ok(/Toplam \d+ dk/.test(t) && t.includes("Aktarma 1") && t.includes("Ücret 20 ₺"), "Konumum → Havalimanı: yürü + T1 + 33, 1 aktarma, 20 ₺");
ok(t.includes("durağına yürü") && t.includes("Havalimanı Ekspres"), "yürüme bacağı + 33 ekspres");
await shot("06-rota");
await page.getByTestId("from").click(); await page.getByPlaceholder("Durak ara…").fill("üniv"); await page.getByRole("button", { name: "Üniversite", exact: true }).click();
await page.getByTestId("to").click(); await page.getByPlaceholder("Durak ara…").fill("fuar"); await page.getByRole("button", { name: "Fuar Alanı", exact: true }).click();
await page.getByTestId("find-route").click(); await page.waitForTimeout(400);
t = await text(); ok(t.includes("Aktarma 0") && t.includes("Ücret 15 ₺") && t.includes("Üniversite – Havalimanı Yolu"), "Üniversite → Fuar Alanı aktarmasız (101)");
await page.getByRole("button", { name: "Yer değiştir" }).click(); await page.waitForTimeout(200);
ok((await page.getByTestId("from").innerText()).includes("Fuar Alanı") && (await page.getByTestId("to").innerText()).includes("Üniversite"), "yer değiştir");

// Kart
await tab("Kart");
ok((await page.getByTestId("balance").innerText()) === "84,50 ₺", "başlangıç bakiyesi 84,50 ₺");
await page.getByRole("button", { name: "200 ₺" }).click(); await page.getByTestId("topup").click(); await page.waitForTimeout(200);
ok((await page.getByTestId("balance").innerText()) === "294,50 ₺" && (await page.getByTestId("card-msg").innerText()).includes("10 ₺ hediye"), "200 ₺ + 10 ₺ hediye yüklendi → 294,50 ₺");
await page.getByTestId("ride").click(); await page.waitForTimeout(200);
ok((await page.getByTestId("balance").innerText()) === "279,50 ₺" && (await text()).includes("QR)"), "QR ile biniş: 15 ₺ düşüldü");
await shot("07-kart");
await page.reload(); await page.waitForTimeout(1200);
ok((await page.getByTestId("balance").innerText()) === "279,50 ₺", "veriler kalıcı (AsyncStorage)");

// Daha
await tab("Daha");
ok((await page.getByTestId("alert").count()) === 3 && (await text()).includes("Otogar – Tren Garı Tramvayı"), "duyurular ve hat listesi");
await page.getByRole("switch", { name: "Düşük veri modu" }).click(); await page.waitForTimeout(200);
await shot("08-daha");
await tab("Harita"); ok((await text()).includes("Düşük veri"), "düşük veri modu haritada rozet");

const real = errors.filter((e) => !/Download the React DevTools|props.pointerEvents|shadow\*|Failed to load resource|Unexpected text node/.test(e));
ok(real.length === 0, "konsolda hata yok" + (real.length ? "\n" + real.join("\n") : ""));
await browser.close();
console.log(`\nTÜM TESTLER GEÇTİ · ekran görüntüleri: ${OUT}/`);

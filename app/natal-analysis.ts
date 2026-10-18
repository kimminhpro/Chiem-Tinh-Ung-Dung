/**
 * Logic phân tích lá số thuần túy (không phụ thuộc React) — dễ kiểm thử độc lập.
 *
 * NGUỒN Ý NGHĨA DUY NHẤT: ~/workspace/vedic-astrology-wiki/
 * - Bản chất graha, vượng/hãm, cung chủ quản: 02-grahas.md
 * - Ý nghĩa 12 nhà, kendra/trikona/dusthana: 03-bhavas.md
 * - Quy tắc yoga: 06-yogas.md
 * - Nguyên tắc luận dasha: 05-vimshottari-dasha.md
 * TUYỆT ĐỐI không bịa ý nghĩa ngoài wiki.
 */

import { RASHIS, type Graha } from "./astro";
import {
  DASHA_LORD_VI,
  type DashaCurrent,
  type DashaLord,
} from "./dasha";

/** Vượng địa chuẩn Jyotish: graha -> sign index (0=Bạch Dương). Hãm = cung đối. */
export const EXALTATION_SIGN: Record<string, number> = {
  sun: 0,
  moon: 1,
  mars: 9,
  mercury: 5,
  jupiter: 3,
  venus: 11,
  saturn: 6,
};

/** Cung chủ quản (wiki/02). Rahu/Ketu: đồng chủ còn tranh luận -> không xét. */
export const OWN_SIGNS: Record<string, number[]> = {
  sun: [4],
  moon: [3],
  mars: [0, 7],
  mercury: [2, 5],
  jupiter: [8, 11],
  venus: [1, 6],
  saturn: [9, 10],
};

/** Chủ tinh của 12 cung (0=Bạch Dương), dùng chủ tinh chính thống. */
export const SIGN_LORD = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];

/** Bản chất graha — 1 cụm từ mỗi hành tinh (wiki/02, cột "Tính chất"). */
export const GRAHA_NATURE: Record<string, string> = {
  sun: "linh hồn, quyền lực, cha",
  moon: "tâm trí, mẹ, cảm xúc",
  mars: "năng lượng, dũng khí, anh em",
  mercury: "trí tuệ, giao dịch, thương mại",
  jupiter: "trí huệ, tài lộc, người thầy",
  venus: "tình yêu, nghệ thuật, hưởng thụ",
  saturn: "kỷ luật, nghiệp quả, sự chậm rãi",
  rahu: "tham vọng, ngoại lai, đột phá, ảo ảnh",
  ketu: "buông bỏ, tâm linh, trực giác",
};

export const HOUSE_NAMES = [
  "Tanu", "Dhana", "Sahaja", "Sukha", "Putra", "Ari",
  "Yuvati", "Randhra", "Dharma", "Karma", "Labha", "Vyaya",
];

/** Ý nghĩa rút gọn 12 nhà (wiki/03). */
export const HOUSE_MEANINGS = [
  "bản thân, thể chất, tính cách",
  "tài sản tích lũy, gia đình",
  "dũng khí, nỗ lực tự thân",
  "mẹ, nhà cửa, hạnh phúc nội tâm",
  "sáng tạo, con cái, tình cảm",
  "đối thủ, bệnh tật, nợ nần",
  "hôn nhân, đối tác",
  "biến cố bất ngờ, thừa kế",
  "phước đức, thầy, vận may",
  "sự nghiệp, địa vị xã hội",
  "thu nhập, bạn bè, ước nguyện",
  "chi tiêu, ẩn dật, nước ngoài",
];

/** Ánh xạ DashaLord -> graha id. */
export const DASHA_LORD_ID: Record<DashaLord, string> = {
  Ketu: "ketu",
  Venus: "venus",
  Sun: "sun",
  Moon: "moon",
  Mars: "mars",
  Rahu: "rahu",
  Jupiter: "jupiter",
  Saturn: "saturn",
  Mercury: "mercury",
};

export type Dignity = "vượng" | "hãm" | "chủ quản" | "bình thường";

export const signOf = (longitude: number) =>
  Math.floor((((longitude % 360) + 360) % 360) / 30);

/** Nhà whole-sign (1-12) của một kinh độ, tính từ Lagna (hoặc mốc tham chiếu). */
export const houseFromLagna = (longitude: number, lagnaLongitude: number) =>
  (signOf(longitude) - signOf(lagnaLongitude) + 12) % 12 + 1;

export function dignityOf(id: string, sign: number): Dignity {
  if (EXALTATION_SIGN[id] === sign) return "vượng";
  if (
    EXALTATION_SIGN[id] !== undefined &&
    (EXALTATION_SIGN[id] + 6) % 12 === sign
  )
    return "hãm";
  if ((OWN_SIGNS[id] ?? []).includes(sign)) return "chủ quản";
  return "bình thường";
}

export const isRetro = (g: Graha) =>
  g.retrograde && g.id !== "rahu" && g.id !== "ketu";

export type YogaHit = { name: string; detail: string };

/**
 * Phát hiện yoga theo quy tắc kiểm chứng được (wiki/06).
 * Yoga chỉ phát huy khi đúng dasha của hành tinh liên quan và được quá cảnh
 * kích hoạt — caller tự ghi chú điều này cho người đọc.
 */
export function detectYogas(
  grahas: Graha[],
  lagnaLongitude: number,
  moonLongitude: number,
): YogaHit[] {
  const hits: YogaHit[] = [];
  const byId = (id: string) => grahas.find((g) => g.id === id)!;

  // Panch Mahapurusha: Hỏa/Thủy/Mộc/Kim/Thổ vượng hoặc ở cung chủ quản
  // + kendra (1,4,7,10) từ Lagna (wiki/06)
  const PMP: Record<string, { name: string; meaning: string }> = {
    mars: { name: "Ruchaka", meaning: "dũng khí, thể thao, bất động sản" },
    mercury: { name: "Bhadra", meaning: "trí tuệ, hùng biện, thương mại" },
    jupiter: { name: "Hamsa", meaning: "đạo đức, cố vấn, được kính trọng" },
    venus: { name: "Malavya", meaning: "nghệ thuật, xa xỉ, sức hút" },
    saturn: { name: "Sasha", meaning: "kỷ luật sắt, thành công muộn" },
  };
  for (const id of Object.keys(PMP)) {
    const g = byId(id);
    const sign = signOf(g.longitude);
    const house = houseFromLagna(g.longitude, lagnaLongitude);
    const strong =
      EXALTATION_SIGN[id] === sign || (OWN_SIGNS[id] ?? []).includes(sign);
    if (strong && [1, 4, 7, 10].includes(house)) {
      hits.push({
        name: `Panch Mahapurusha — ${PMP[id].name} (${g.name})`,
        detail: `${g.name} ${EXALTATION_SIGN[id] === sign ? "vượng địa" : "ở cung chủ quản"} tại nhà ${house} (kendra): ${PMP[id].meaning}.`,
      });
    }
  }

  // Budha-Aditya: Thủy + Trời đồng cung (cùng nhà từ Lagna)
  const sunHouse = houseFromLagna(byId("sun").longitude, lagnaLongitude);
  const merHouse = houseFromLagna(byId("mercury").longitude, lagnaLongitude);
  if (sunHouse === merHouse) {
    hits.push({
      name: "Budha-Aditya",
      detail: `Thủy + Trời đồng cung tại nhà ${sunHouse} — trí tuệ sắc bén, giỏi tính toán.`,
    });
  }

  // Chandra-Mangala: Trăng + Hỏa đồng cung
  const moonHouse = houseFromLagna(byId("moon").longitude, lagnaLongitude);
  const marsHouse = houseFromLagna(byId("mars").longitude, lagnaLongitude);
  if (moonHouse === marsHouse) {
    hits.push({
      name: "Chandra-Mangala",
      detail: `Trăng + Hỏa đồng cung tại nhà ${moonHouse} — "yoga tiền" nhưng nóng vội, cần kỷ luật.`,
    });
  }

  // Gaja Kesari: Mộc ở kendra tính từ Mặt Trăng
  const jupHouseFromMoon = houseFromLagna(
    byId("jupiter").longitude,
    moonLongitude,
  );
  if ([1, 4, 7, 10].includes(jupHouseFromMoon)) {
    hits.push({
      name: "Gaja Kesari",
      detail: `Mộc ở kendra (nhà ${jupHouseFromMoon}) tính từ Mặt Trăng — thông minh, danh tiếng, được quý nhân giúp.`,
    });
  }

  return hits;
}

/** Câu mô tả 1 graha: cung + nhà + tình trạng + ý nghĩa (wiki/02, 03). */
export function describeGraha(
  g: Graha,
  lagnaLongitude: number,
): string {
  const sign = signOf(g.longitude);
  const house = houseFromLagna(g.longitude, lagnaLongitude);
  const d = dignityOf(g.id, sign);
  const dignityNote =
    d === "vượng"
      ? " Vượng địa — phát huy mạnh mẽ."
      : d === "hãm"
        ? " Hãm địa — điểm cần rèn luyện."
        : d === "chủ quản"
          ? " Ở cung chủ quản — vững chắc."
          : "";
  const retroNote = isRetro(g) ? " Đang nghịch hành." : "";
  return (
    `${g.name} ở ${RASHIS[sign][1]} — nhà ${house} (${HOUSE_NAMES[house - 1]}: ` +
    `${HOUSE_MEANINGS[house - 1]}): ${GRAHA_NATURE[g.id]}.${dignityNote}${retroNote}`
  );
}

/**
 * Luận đại vận hiện tại: chủ tinh làm chủ nhà nào + thế đứng + nguyên tắc
 * wiki/05 (hành tinh mạnh -> vận thuận; chủ nhà 6/8/12 hoặc maraka 2/7 -> thận trọng).
 */
export function describeDashaCurrent(
  grahas: Graha[],
  lagnaLongitude: number,
  current: DashaCurrent,
): string {
  const mdId = DASHA_LORD_ID[current.mahadasha];
  const mdGraha = grahas.find((g) => g.id === mdId)!;
  const mdSign = signOf(mdGraha.longitude);
  const mdHouse = houseFromLagna(mdGraha.longitude, lagnaLongitude);
  const ruled = SIGN_LORD.map((lord, i) => (lord === mdId ? i + 1 : -1)).filter(
    (h) => h > 0,
  );
  const d = dignityOf(mdId, mdSign);
  const strong = d === "vượng" || [1, 4, 7, 10, 5, 9].includes(mdHouse);
  const weak = d === "hãm" || [6, 8, 12].includes(mdHouse);
  const hardHouses = ruled.filter((h) => [6, 8, 12].includes(h));
  const marakaHouses = ruled.filter((h) => [2, 7].includes(h));
  return (
    `Đại vận ${DASHA_LORD_VI[current.mahadasha]}: ${mdGraha.name} làm chủ nhà ` +
    `${ruled.join(", ")}, đang ở nhà ${mdHouse} (${HOUSE_NAMES[mdHouse - 1]})` +
    `${d !== "bình thường" ? `, thế ${d}` : ""}. ` +
    (strong
      ? "Hành tinh mạnh trong lá số (vượng/kendra/trikona) — vận có nền tảng thuận."
      : weak
        ? "Hành tinh yếu (hãm/ở dusthana) — vận cần thận trọng."
        : "Hành tinh ở thế trung bình.") +
    (hardHouses.length > 0
      ? ` Lưu ý: chủ nhà khó ${hardHouses.join(", ")} (6/8/12) — đề phòng biến cố, sức khỏe.`
      : "") +
    (marakaHouses.length > 0
      ? ` Chủ nhà maraka ${marakaHouses.join(", ")} (2/7).`
      : "") +
    " Đại vận cho bối cảnh, tiểu vận cho sự kiện cụ thể (wiki/05)."
  );
}

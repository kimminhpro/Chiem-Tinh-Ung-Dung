/**
 * Vimshottari Dasha + Navamsa (D9) — port trung thành từ CLI Python
 * `~/workspace/custom-skills/local-vedic-astrology/bin/vedic-astro`
 * (hàm vimshottari, navamsa_of, jd_to_iso).
 *
 * Quy ước giữ nguyên 1:1 với CLI:
 * - DASHA_SEQ / DASHA_YEARS / YEAR_DAYS = 365.25
 * - Đại vận đầu rút ngắn theo phần Nakshatra của Mặt Trăng đã đi qua
 * - Antardasha bắt đầu từ chính chủ tinh của Mahadasha
 * - Pratyantardasha tính từ Antardasha hiện tại
 */

export const DASHA_SEQ = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
] as const;

export type DashaLord = (typeof DASHA_SEQ)[number];

export const DASHA_YEARS: Record<DashaLord, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const DASHA_LORD_VI: Record<DashaLord, string> = {
  Ketu: "Kế Đô",
  Venus: "Kim",
  Sun: "Mặt Trời",
  Moon: "Mặt Trăng",
  Mars: "Hỏa",
  Rahu: "La Hầu",
  Jupiter: "Mộc",
  Saturn: "Thổ",
  Mercury: "Thủy",
};

const YEAR_DAYS = 365.25;
const NAKSHATRA_SPAN = 360 / 27;

export type Antardasha = {
  lord: DashaLord;
  start: string;
  end: string;
  startJd: number;
  endJd: number;
};

export type Mahadasha = {
  mahadasha: DashaLord;
  years: number;
  start: string;
  end: string;
  startJd: number;
  endJd: number;
  antardashas: Antardasha[];
};

export type DashaCurrent = {
  mahadasha: DashaLord;
  mahadashaStart: string;
  mahadashaEnd: string;
  antardasha: DashaLord;
  antardashaStart: string;
  antardashaEnd: string;
  pratyantardasha: DashaLord;
  pratyantardashaStart: string;
  pratyantardashaEnd: string;
};

/** Julian day -> "YYYY-MM-DD" (UTC), tương đương jd_to_iso của CLI. */
export function jdToIso(jd: number): string {
  return new Date((jd - 2440587.5) * 86400000).toISOString().slice(0, 10);
}

/**
 * Cung Navamsa (D9) của một kinh độ.
 * Movable (s%3==0): đếm từ chính cung; fixed: từ cung thứ 9; dual: từ cung thứ 5.
 */
export function navamsaSignIndex(longitude: number): number {
  const lon = ((longitude % 360) + 360) % 360;
  const s = Math.floor(lon / 30) % 12;
  const pada = Math.floor((lon % 30) / (30 / 9));
  const kind = s % 3;
  const start = kind === 0 ? s : kind === 1 ? (s + 8) % 12 : (s + 4) % 12;
  return (start + pada) % 12;
}

/** Chủ tinh Nakshatra của một kinh độ (theo vòng Vimshottari). */
export function nakshatraLord(longitude: number): DashaLord {
  const lon = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  return DASHA_SEQ[idx % 9];
}

/**
 * Toàn bộ timeline Vimshottari 120 năm tính từ lúc sinh.
 * Trả về danh sách đại vận + hàm tra vận hiện tại tại một thời điểm (JD).
 */
export function vimshottari(
  moonLongitude: number,
  birthJd: number,
): { periods: Mahadasha[]; currentAt: (atJd: number) => DashaCurrent | null } {
  const moonLon = ((moonLongitude % 360) + 360) % 360;
  const nakIdx = Math.floor(moonLon / NAKSHATRA_SPAN) % 27;
  const traversed = (moonLon % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const firstLord = DASHA_SEQ[nakIdx % 9];

  const periods: Mahadasha[] = [];
  let cursor = birthJd;
  for (let i = 0; i < 12; i += 1) {
    const lord = DASHA_SEQ[(nakIdx % 9 + i) % 9];
    const yrs =
      i === 0 ? DASHA_YEARS[firstLord] * (1 - traversed) : DASHA_YEARS[lord];
    const mdStart = cursor;
    const mdEnd = cursor + yrs * YEAR_DAYS;
    const antardashas: Antardasha[] = [];
    const sub = DASHA_SEQ.indexOf(lord);
    for (let j = 0; j < 9; j += 1) {
      const alord = DASHA_SEQ[(sub + j) % 9];
      const ayrs = (yrs * DASHA_YEARS[alord]) / 120;
      const aStart =
        antardashas.length > 0 ? antardashas[antardashas.length - 1].endJd : mdStart;
      const aEnd = aStart + ayrs * YEAR_DAYS;
      antardashas.push({
        lord: alord,
        start: jdToIso(aStart),
        end: jdToIso(aEnd),
        startJd: aStart,
        endJd: aEnd,
      });
    }
    periods.push({
      mahadasha: lord,
      years: Math.round(yrs * 1000) / 1000,
      start: jdToIso(mdStart),
      end: jdToIso(mdEnd),
      startJd: mdStart,
      endJd: mdEnd,
      antardashas,
    });
    cursor = mdEnd;
  }

  const currentAt = (atJd: number): DashaCurrent | null => {
    for (const p of periods) {
      if (p.startJd <= atJd && atJd < p.endJd) {
        for (const a of p.antardashas) {
          if (a.startJd <= atJd && atJd < a.endJd) {
            const adYrs = (a.endJd - a.startJd) / YEAR_DAYS;
            const sub2 = DASHA_SEQ.indexOf(a.lord);
            let c2 = a.startJd;
            for (let k = 0; k < 9; k += 1) {
              const plord = DASHA_SEQ[(sub2 + k) % 9];
              const pyrs = (adYrs * DASHA_YEARS[plord]) / 120;
              const pEnd = c2 + pyrs * YEAR_DAYS;
              if (c2 <= atJd && atJd < pEnd) {
                return {
                  mahadasha: p.mahadasha,
                  mahadashaStart: p.start,
                  mahadashaEnd: p.end,
                  antardasha: a.lord,
                  antardashaStart: a.start,
                  antardashaEnd: a.end,
                  pratyantardasha: plord,
                  pratyantardashaStart: jdToIso(c2),
                  pratyantardashaEnd: jdToIso(pEnd),
                };
              }
              c2 = pEnd;
            }
          }
        }
      }
    }
    return null;
  };

  return { periods, currentAt };
}

"use client";

import { useState } from "react";
import { calculateSwissGrahas } from "./swiss";
import { zonedDateTimeToUtc } from "./observer";
import { D1Chart } from "./D1Chart";
import { PositionList } from "./PositionList";
import {
  formatDegree,
  getNakshatra,
  RASHIS,
  type Graha,
} from "./astro";
import {
  DASHA_LORD_VI,
  nakshatraLord,
  navamsaSignIndex,
  vimshottari,
  type DashaCurrent,
  type Mahadasha,
} from "./dasha";
import { BIRTHPLACES, CUSTOM_PLACE_ID } from "./places";

/** Vượng địa chuẩn Jyotish: graha -> sign index (0=Aries). Hãm = cung đối. */
const EXALTATION_SIGN: Record<string, number> = {
  sun: 0,
  moon: 1,
  mars: 9,
  mercury: 5,
  jupiter: 3,
  venus: 11,
  saturn: 6,
};

type NatalResult = {
  name: string;
  grahas: Graha[];
  lagnaLongitude: number;
  chandraMode: boolean;
  moonLongitude: number;
  ayanamsa: number;
  periods: Mahadasha[];
  current: DashaCurrent | null;
  asOf: string;
};

const toNavamsaGrahas = (grahas: Graha[]): Graha[] =>
  grahas.map((graha) => {
    const sign = navamsaSignIndex(graha.longitude);
    return { ...graha, longitude: sign * 30 + (graha.longitude % 30) };
  });

const toNavamsaLagna = (lagnaLongitude: number): number => {
  const sign = navamsaSignIndex(lagnaLongitude);
  return sign * 30 + (lagnaLongitude % 30);
};

const houseFromLagna = (longitude: number, lagnaLongitude: number) =>
  (Math.floor(longitude / 30) - Math.floor(lagnaLongitude / 30) + 12) % 12 + 1;

function Interpretation({ result }: { result: NatalResult }) {
  const { grahas, lagnaLongitude, chandraMode, moonLongitude } = result;
  const lagnaSign = Math.floor(lagnaLongitude / 30);
  const lagnaNak = getNakshatra(lagnaLongitude);
  const moon = grahas.find((g) => g.id === "moon")!;
  const moonSign = Math.floor(moonLongitude / 30);
  const moonNak = getNakshatra(moonLongitude);
  const retro = grahas.filter(
    (g) => g.retrograde && g.id !== "rahu" && g.id !== "ketu",
  );
  const exalted = grahas.filter(
    (g) => EXALTATION_SIGN[g.id] === Math.floor(g.longitude / 30),
  );
  const debilitated = grahas.filter(
    (g) =>
      EXALTATION_SIGN[g.id] !== undefined &&
      (EXALTATION_SIGN[g.id] + 6) % 12 === Math.floor(g.longitude / 30),
  );
  const kendraCount = grahas.filter((g) =>
    [1, 4, 7, 10].includes(houseFromLagna(g.longitude, lagnaLongitude)),
  ).length;

  const bullets: string[] = [
    `${chandraMode ? "Chandra Lagna" : "Cung Mọc (Lagna)"}: ${RASHIS[lagnaSign][1]} ${RASHIS[lagnaSign][2]} — Nakshatra ${lagnaNak.name}, pada ${lagnaNak.pada}.`,
    `Mặt Trăng ở ${RASHIS[moonSign][1]} — Nakshatra ${moonNak.name} pada ${moonNak.pada}, chủ tinh Nakshatra: ${DASHA_LORD_VI[nakshatraLord(moonLongitude)]}.`,
    result.current
      ? `Đang trong đại vận ${DASHA_LORD_VI[result.current.mahadasha]} (${result.current.mahadashaStart} → ${result.current.mahadashaEnd}), tiểu vận ${DASHA_LORD_VI[result.current.antardasha]} (đến ${result.current.antardashaEnd}), chi vận ${DASHA_LORD_VI[result.current.pratyantardasha]} (đến ${result.current.pratyantardashaEnd}).`
      : "Chưa xác định được vận hiện tại.",
    retro.length > 0
      ? `Hành tinh nghịch hành: ${retro.map((g) => g.name).join(", ")} — năng lượng hướng nội, cần chiêm nghiệm kỹ trước khi hành động.`
      : "Không có hành tinh nghịch hành (ngoài Rahu/Ketu luôn đi ngược).",
    exalted.length > 0
      ? `Hành tinh vượng: ${exalted.map((g) => `${g.name} ở ${RASHIS[Math.floor(g.longitude / 30)][1]}`).join(", ")}.`
      : "Không có hành tinh vượng địa.",
    debilitated.length > 0
      ? `Hành tinh hãm: ${debilitated.map((g) => `${g.name} ở ${RASHIS[Math.floor(g.longitude / 30)][1]}`).join(", ")} — điểm cần rèn luyện, không phải điểm xấu tuyệt đối.`
      : "Không có hành tinh hãm địa.",
    `Có ${kendraCount}/9 graha ở kendra (nhà 1, 4, 7, 10) — trụ cột của lá số.`,
  ];

  return (
    <section className="natal-insight" aria-label="Diễn giải nhanh">
      <h3>Diễn giải nhanh <span>(tự động · rút gọn)</span></h3>
      <ul>
        {bullets.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </section>
  );
}

export function NatalChart() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [birthTime, setBirthTime] = useState("12:00");
  const [unknownTime, setUnknownTime] = useState(false);
  const [placeId, setPlaceId] = useState("hochiminh");
  const [customLat, setCustomLat] = useState("10.8231");
  const [customLon, setCustomLon] = useState("106.6297");
  const [tzInput, setTzInput] = useState("Asia/Ho_Chi_Minh");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NatalResult | null>(null);
  const [varga, setVarga] = useState<"D1" | "D9">("D1");
  const [selected, setSelected] = useState("sun");

  const applyPlace = (id: string) => {
    setPlaceId(id);
    const place = BIRTHPLACES.find((p) => p.id === id);
    if (place) setTzInput(place.timeZone);
  };

  const compute = async () => {
    setError(null);
    setResult(null);
    let latitude: number;
    let longitude: number;
    if (placeId === CUSTOM_PLACE_ID) {
      latitude = Number(customLat);
      longitude = Number(customLon);
      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        setError("Tọa độ không hợp lệ (vĩ độ −90…90, kinh độ −180…180).");
        return;
      }
    } else {
      const place = BIRTHPLACES.find((p) => p.id === placeId);
      if (!place) {
        setError("Chưa chọn nơi sinh.");
        return;
      }
      latitude = place.latitude;
      longitude = place.longitude;
    }

    const tz = tzInput.trim();
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz }).format(new Date());
    } catch {
      setError(`Múi giờ không hợp lệ: "${tz}". Ví dụ đúng: Asia/Ho_Chi_Minh.`);
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError("Ngày sinh chưa đúng định dạng.");
      return;
    }
    const timeStr = unknownTime ? "12:00" : birthTime;
    if (!/^\d{2}:\d{2}$/.test(timeStr)) {
      setError("Giờ sinh chưa đúng định dạng.");
      return;
    }

    let birthUtc: Date | null;
    try {
      birthUtc = zonedDateTimeToUtc(`${birthDate}T${timeStr}`, tz);
    } catch {
      birthUtc = null;
    }
    if (!birthUtc) {
      setError("Không tính được thời điểm sinh từ ngày/giờ/múi giờ đã nhập.");
      return;
    }

    setLoading(true);
    try {
      const res = await calculateSwissGrahas(birthUtc, latitude, longitude);
      const moon = res.grahas.find((g) => g.id === "moon")!;
      const lagna = unknownTime ? moon.longitude : res.lagnaLongitude;
      const { periods, currentAt } = vimshottari(moon.longitude, res.julianDay);
      const nowJd = Date.now() / 86400000 + 2440587.5;
      const asOf = new Date().toISOString().slice(0, 10);
      setResult({
        name: name.trim(),
        grahas: res.grahas,
        lagnaLongitude: lagna,
        chandraMode: unknownTime,
        moonLongitude: moon.longitude,
        ayanamsa: res.ayanamsa,
        periods,
        current: currentAt(nowJd),
        asOf,
      });
      setSelected("sun");
      setVarga("D1");
    } catch (e) {
      setError(
        `Không tính được lá số: ${e instanceof Error ? e.message : "lỗi không rõ"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const shownGrahas = result
    ? varga === "D9"
      ? toNavamsaGrahas(result.grahas)
      : result.grahas
    : [];
  const shownLagna =
    result == null
      ? 0
      : varga === "D9"
        ? toNavamsaLagna(result.lagnaLongitude)
        : result.lagnaLongitude;

  const currentIndex = result
    ? result.periods.findIndex(
        (p) =>
          result.current != null &&
          p.mahadasha === result.current.mahadasha &&
          p.start === result.current.mahadashaStart,
      )
    : -1;

  return (
    <div className="natal">
      <section className="natal-form-card" aria-label="Nhập thông tin sinh">
        <h2>Lập lá số cá nhân</h2>
        <p className="natal-lead">
          Nhập ngày, giờ và nơi sinh để xem lá số Vệ Đà của bạn: cung Mọc,
          9 graha, Navamsa (D9) và vận hạn Vimshottari.
        </p>
        <div className="natal-form">
          <label>
            Họ tên <span className="optional">(không bắt buộc)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              autoComplete="off"
            />
          </label>
          <label>
            Ngày sinh
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>
          <label className={unknownTime ? "dimmed" : ""}>
            Giờ sinh
            <input
              type="time"
              value={birthTime}
              disabled={unknownTime}
              onChange={(e) => setBirthTime(e.target.value)}
            />
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={unknownTime}
              onChange={(e) => setUnknownTime(e.target.checked)}
            />
            Tôi không nhớ giờ sinh
          </label>
          <label>
            Nơi sinh
            <select value={placeId} onChange={(e) => applyPlace(e.target.value)}>
              <optgroup label="Việt Nam">
                {BIRTHPLACES.filter((p) => p.timeZone === "Asia/Ho_Chi_Minh").map(
                  (p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ),
                )}
              </optgroup>
              <optgroup label="Nhật Bản">
                {BIRTHPLACES.filter((p) => p.timeZone === "Asia/Tokyo").map(
                  (p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ),
                )}
              </optgroup>
              <option value={CUSTOM_PLACE_ID}>Tự nhập tọa độ…</option>
            </select>
          </label>
          {placeId === CUSTOM_PLACE_ID && (
            <>
              <label>
                Vĩ độ
                <input
                  type="number"
                  step="0.0001"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                />
              </label>
              <label>
                Kinh độ
                <input
                  type="number"
                  step="0.0001"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                />
              </label>
            </>
          )}
          <label>
            Múi giờ (IANA)
            <input
              type="text"
              value={tzInput}
              onChange={(e) => setTzInput(e.target.value)}
              placeholder="Asia/Ho_Chi_Minh"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        </div>
        {unknownTime && (
          <p className="natal-note">
            Không nhớ giờ sinh: lá số dùng <b>Chandra Lagna</b> (lấy Mặt Trăng
            lúc 12:00 trưa ngày sinh làm cung Mọc thay thế). Vận hạn Vimshottari
            vẫn tính được vì dựa vào Nakshatra của Mặt Trăng.
          </p>
        )}
        {error && (
          <p className="natal-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          className="natal-submit"
          onClick={compute}
          disabled={loading}
        >
          {loading ? "Đang tính toán…" : "Lập lá số"}
        </button>
      </section>

      {result && (
        <div className="natal-result">
          <div className="natal-result-head">
            <div>
              <p>Lá số Vệ Đà</p>
              <h2>
                {result.name ? `${result.name} · ` : ""}Lagna{" "}
                {RASHIS[Math.floor(result.lagnaLongitude / 30)][1]}
              </h2>
              <span className="sky-location">
                {result.chandraMode
                  ? "◎ Chandra Lagna — chưa xác minh giờ sinh"
                  : "◎ Lagna từ giờ sinh"} · Whole Sign · Lahiri · ayanāṃśa{" "}
                {result.ayanamsa.toFixed(4)}°
              </span>
            </div>
            <div className="view-mode" aria-label="Phân đồ">
              <button
                type="button"
                className={varga === "D1" ? "active" : ""}
                onClick={() => setVarga("D1")}
                aria-pressed={varga === "D1"}
              >
                D1 · Rāśi
              </button>
              <button
                type="button"
                className={varga === "D9" ? "active" : ""}
                onClick={() => setVarga("D9")}
                aria-pressed={varga === "D9"}
              >
                D9 · Navamsa
              </button>
            </div>
          </div>

          <div className="natal-grid">
            <div>
              <D1Chart
                grahas={shownGrahas}
                lagnaLongitude={shownLagna}
                selected={selected}
                onSelect={setSelected}
                vargaLabel={varga}
              />
              <section className="natal-dasha" aria-label="Vận hạn Vimshottari">
                <div className="panel-heading">
                  <div>
                    <p>Vimshottari · 120 năm</p>
                    <h2>Vận hạn hiện tại</h2>
                  </div>
                  <span>tính đến {result.asOf}</span>
                </div>
                {result.current ? (
                  <div className="dasha-now">
                    <div>
                      <small>Đại vận</small>
                      <strong>
                        {DASHA_LORD_VI[result.current.mahadasha]}
                      </strong>
                      <span>
                        {result.current.mahadashaStart} →{" "}
                        {result.current.mahadashaEnd}
                      </span>
                    </div>
                    <div>
                      <small>Tiểu vận</small>
                      <strong>
                        {DASHA_LORD_VI[result.current.antardasha]}
                      </strong>
                      <span>
                        {result.current.antardashaStart} →{" "}
                        {result.current.antardashaEnd}
                      </span>
                    </div>
                    <div>
                      <small>Chi vận</small>
                      <strong>
                        {DASHA_LORD_VI[result.current.pratyantardasha]}
                      </strong>
                      <span>
                        {result.current.pratyantardashaStart} →{" "}
                        {result.current.pratyantardashaEnd}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="natal-note">Chưa xác định được vận hiện tại.</p>
                )}
                <ol className="dasha-timeline">
                  {result.periods.map((p, i) => {
                    const isCurrent = i === currentIndex;
                    const isNext =
                      currentIndex >= 0 &&
                      i > currentIndex &&
                      i <= currentIndex + 3;
                    return (
                      <li
                        key={`${p.mahadasha}-${p.start}`}
                        className={
                          isCurrent ? "current" : isNext ? "next" : ""
                        }
                      >
                        <b>{DASHA_LORD_VI[p.mahadasha]}</b>
                        <span>
                          {p.start} → {p.end}
                        </span>
                        {isCurrent && <em>hiện tại</em>}
                        {isNext && <em>kế tiếp</em>}
                      </li>
                    );
                  })}
                </ol>
              </section>
            </div>
            <div>
              <PositionList
                grahas={shownGrahas}
                selected={selected}
                onSelect={setSelected}
                heading={varga === "D9" ? "Vị trí Graha · D9" : "Vị trí Graha"}
              />
              <Interpretation result={result} />
            </div>
          </div>

          <section className="natal-privacy" aria-label="Cam kết riêng tư">
            <p>
              <b>Riêng tư:</b> mọi tính toán chạy 100% trên trình duyệt của bạn
              bằng Swiss Ephemeris — thông tin ngày sinh không được gửi đi đâu.
            </p>
            <p>
              <b>Lưu ý:</b> nội dung mang tính tham khảo và học thuật về chiêm
              tinh Vệ Đà, không phải lời khuyên đầu tư, tài chính hay y tế.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

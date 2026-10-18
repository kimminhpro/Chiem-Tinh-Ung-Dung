"use client";

import { useEffect, useState } from "react";
import { calculateSwissGrahas, type SwissResult } from "./swiss";
import { RASHIS } from "./astro";
import { houseFromLagna } from "./natal-analysis";
import type { NatalResult } from "./NatalChart";

/**
 * Quá cảnh hôm nay (Gochara): vị trí 9 graha HIỆN TẠI so với lá số natal.
 * Nguồn quy tắc: ~/workspace/vedic-astrology-wiki/07-gochara.md
 * - Sade Sati: Thổ quá cảnh nhà 12/1/2 tính từ Mặt Trăng natal (~7.5 năm).
 * - Mộc quá cảnh nhà 2/5/7/9/11 từ Lagna (hoặc Trăng) = năm thuận.
 */

const signName = (longitude: number) =>
  RASHIS[Math.floor((((longitude % 360) + 360) % 360) / 30)][1];

export function TransitToday({ result }: { result: NatalResult }) {
  const [state, setState] = useState<{
    transit: SwissResult | null;
    failed: boolean;
  }>({ transit: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    // Dùng tọa độ nơi sinh đã nhập — không cần vị trí thiết bị
    calculateSwissGrahas(new Date(), result.latitude, result.longitude)
      .then((res) => {
        if (!cancelled) setState({ transit: res, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ transit: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [result]);

  const { transit, failed } = state;

  const today = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (failed) {
    return (
      <section className="natal-transit" aria-label="Quá cảnh hôm nay">
        <div className="panel-heading">
          <div>
            <p>Gochara</p>
            <h2>Quá cảnh hôm nay</h2>
          </div>
        </div>
        <p className="natal-note">Không tính được vị trí hành tinh hiện tại.</p>
      </section>
    );
  }

  if (!transit) {
    return (
      <section className="natal-transit" aria-label="Quá cảnh hôm nay">
        <div className="panel-heading">
          <div>
            <p>Gochara · {today}</p>
            <h2>Quá cảnh hôm nay</h2>
          </div>
        </div>
        <p className="natal-note">Đang tính vị trí các hành tinh lúc này…</p>
      </section>
    );
  }

  const saturn = transit.grahas.find((g) => g.id === "saturn")!;
  const jupiter = transit.grahas.find((g) => g.id === "jupiter")!;
  const sadeHouse = houseFromLagna(saturn.longitude, result.moonLongitude);
  const sadePhase =
    sadeHouse === 12
      ? "khởi phát"
      : sadeHouse === 1
        ? "đỉnh điểm"
        : sadeHouse === 2
          ? "hoàn tất"
          : null;
  const jupHouseLagna = houseFromLagna(jupiter.longitude, result.lagnaLongitude);
  const satHouseLagna = houseFromLagna(saturn.longitude, result.lagnaLongitude);
  const jupGood = [2, 5, 7, 9, 11].includes(jupHouseLagna);

  return (
    <section className="natal-transit" aria-label="Quá cảnh hôm nay">
      <div className="panel-heading">
        <div>
          <p>Gochara · {today}</p>
          <h2>Quá cảnh hôm nay</h2>
        </div>
        <span>so với Lagna &amp; Mặt Trăng natal</span>
      </div>

      <div className="transit-summary">
        {sadePhase ? (
          <p className="natal-note">
            <b>Sade Sati:</b> Thổ đang quá cảnh nhà {sadeHouse} tính từ Mặt
            Trăng natal — đang trong Sade Sati giai đoạn <b>{sadePhase}</b>{" "}
            (~7.5 năm thử thách, tái cấu trúc đời sống; đỉnh điểm khi Thổ trùng
            Trăng natal).
          </p>
        ) : (
          <p className="natal-note">
            <b>Sade Sati:</b> Thổ không ở nhà 12/1/2 tính từ Mặt Trăng natal —
            hiện <b>không</b> trong Sade Sati.
          </p>
        )}
        <p className="natal-note">
          <b>Mộc</b> quá cảnh nhà {jupHouseLagna} tính từ Lagna
          {jupGood
            ? " — năm thuận cho tài lộc và mở rộng."
            : "."}{" "}
          <b>Thổ</b> quá cảnh nhà {satHouseLagna} tính từ Lagna.
        </p>
      </div>

      <ul className="transit-list">
        {transit.grahas.map((g) => {
          const hLagna = houseFromLagna(g.longitude, result.lagnaLongitude);
          const hMoon = houseFromLagna(g.longitude, result.moonLongitude);
          return (
            <li key={g.id}>
              <b>{g.name}</b>
              <span>
                {signName(g.longitude)} · nhà {hLagna} từ Lagna · nhà {hMoon}{" "}
                từ Trăng
                {g.retrograde && g.id !== "rahu" && g.id !== "ketu" ? (
                  <em> ℞ nghịch hành</em>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

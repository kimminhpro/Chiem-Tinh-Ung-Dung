"use client";

import { useState } from "react";
import { JyotishOrbit } from "./JyotishOrbit";
import { NatalChart } from "./NatalChart";

type Tab = "sky" | "natal";

export default function Home() {
  const [tab, setTab] = useState<Tab>("sky");

  return (
    <div className="site">
      <header className="site-header">
        <div className="site-brand">
          <span className="brand-mark">✺</span>
          <span>
            <strong>Chiêm Tinh Ứng Dụng</strong>
            <small>Jyotish Vệ Đà cho đời sống · công việc · trading</small>
          </span>
        </div>
        <nav className="site-tabs" aria-label="Chế độ xem">
          <button
            type="button"
            className={tab === "sky" ? "active" : ""}
            onClick={() => setTab("sky")}
            aria-pressed={tab === "sky"}
          >
            Bầu trời
          </button>
          <button
            type="button"
            className={tab === "natal" ? "active" : ""}
            onClick={() => setTab("natal")}
            aria-pressed={tab === "natal"}
          >
            Lá số của bạn
          </button>
        </nav>
      </header>

      <div className="site-body">
        {tab === "sky" ? (
          <JyotishOrbit initialDate={new Date().toISOString()} />
        ) : (
          <main className="natal-tab">
            <NatalChart />
          </main>
        )}
      </div>

      <footer className="site-footer">
        <p>
          <b>Chiêm Tinh Ứng Dụng</b> — phương pháp tính: Swiss Ephemeris ·{" "}
          <a
            href="https://www.astro.com/swisseph/"
            target="_blank"
            rel="noreferrer"
          >
            Swiss Ephemeris
          </a>{" "}
          (AGPL-3.0) · ayanāṃśa Lahiri · nhà Whole Sign · Vimshottari 120 năm.
        </p>
        <p className="disclaimer">
          Nội dung trên trang mang tính tham khảo và học thuật về chiêm tinh
          Vệ Đà, không phải lời khuyên đầu tư, tài chính hay y tế. Mọi tính
          toán lá số chạy hoàn toàn trên trình duyệt của bạn, không gửi dữ
          liệu đi đâu.
        </p>
      </footer>
    </div>
  );
}

"use client";

import { formatDegree, getNakshatra, RASHIS, type Graha } from "./astro";

const formatLatitude = (latitude: number) =>
  `${latitude >= 0 ? "+" : "−"}${Math.abs(latitude).toFixed(3)}°`;

const formatDistance = (distance: number) =>
  `${distance < 0.01 ? distance.toFixed(6) : distance.toFixed(4)} AU`;

export function PositionList({
  grahas,
  selected,
  onSelect,
  heading = "Vị trí Graha",
}: {
  grahas: Graha[];
  selected: string;
  onSelect: (id: string) => void;
  heading?: string;
}) {
  return (
    <section className="positions" aria-labelledby="positions-title">
      <div className="panel-heading">
        <div>
          <p>Navagraha</p>
          <h2 id="positions-title">{heading}</h2>
        </div>
        <span>Sidereal</span>
      </div>
      <div className="position-head">
        <span>Graha</span>
        <span>Kinh độ / β / AU</span>
        <span>Rāśi / Nakshatra</span>
      </div>
      <div className="position-list">
        {grahas.length === 0 && (
          <div className="position-loading">Đang tính vị trí Navagraha…</div>
        )}
        {grahas.map((graha) => {
          const rashi = RASHIS[Math.floor(graha.longitude / 30)];
          const nakshatra = getNakshatra(graha.longitude);
          return (
            <button
              type="button"
              className={`position-row ${selected === graha.id ? "active" : ""}`}
              key={graha.id}
              onClick={() => onSelect(graha.id)}
            >
              <span className="graha-name">
                <i style={{ color: graha.color }}>{graha.symbol}</i>
                <span>
                  <strong>{graha.name}</strong>
                  <small>{graha.sanskrit}</small>
                </span>
              </span>
              <span className="degree">
                <span>
                  {formatDegree(graha.longitude)}
                  {graha.retrograde && <em>℞</em>}
                </span>
                <small>
                  {graha.id === "rahu" || graha.id === "ketu"
                    ? "Giao điểm · β 0°"
                    : `β ${formatLatitude(graha.latitude)} · ${formatDistance(graha.distance)}`}
                </small>
              </span>
              <span className="rashi-name">
                <b>{rashi[2]}</b>
                <span className="rashi-stack">
                  <strong>{rashi[1]}</strong>
                  <small>
                    {nakshatra.name} · P{nakshatra.pada}
                  </small>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

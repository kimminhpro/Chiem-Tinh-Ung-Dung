# Đối chiếu số liệu — web app vs CLI Python `vedic-astro`

Ngày kiểm chứng: 2026-10-18. Chuẩn đối chiếu: CLI
`~/workspace/custom-skills/local-vedic-astrology/bin/vedic-astro`
(pyswisseph, Lahiri). Ngưỡng sai số: < 0.01°.

## Build

- `npm run build` (Next.js 16.4.2, `output: "export"`): **PASS** —
  compiled + TypeScript + static export thành công.

## Phương pháp đối chiếu

Port TypeScript (`app/dasha.ts`, `app/observer.ts`, `app/astro.ts`) được nạp
trực tiếp vào Node và so với JSON của CLI cho 3 ca test (`--asof 2026-10-18`).
Script: `/tmp/verify.mjs` (+ `/tmp/gen_expected.py` sinh dữ liệu kỳ vọng).

### Ca test

| Ca | Ngày sinh | Giờ | Múi giờ | Nơi sinh | Ghi chú |
|----|-----------|-----|---------|----------|---------|
| A | 1990-06-15 | 08:30 | Asia/Ho_Chi_Minh | 10.8231, 106.6297 (TP.HCM) | sinh ban ngày |
| B | 1985-12-03 | 23:15 | Asia/Tokyo | 34.8796, 136.9888 (Hekinan) | sinh ban đêm |
| C | 2000-01-01 | — (12:00) | Asia/Ho_Chi_Minh | 10.8231, 106.6297 | không nhớ giờ → Chandra Lagna |

### Kết quả từng ca

| Hạng mục | A | B | C |
|----------|---|---|---|
| Ngày/giờ địa phương → epoch ms (`zonedDateTimeToUtc`) | PASS | PASS | PASS |
| Nakshatra + pada của Mặt Trăng | PASS (Pushya p3 — khớp CLI) | PASS | PASS |
| Navamsa (D9) của 9 graha | PASS 9/9 | PASS 9/9 | PASS 9/9 |
| Nhà whole-sign từ Lagna của 9 graha | PASS 9/9 | PASS 9/9 | PASS 9/9 |
| Vimshottari hiện tại MD/AD/PD + ngày bắt đầu/kết thúc | PASS (Thổ/Rahu/Thổ) | PASS (Mặt Trăng/Rahu/Hỏa) | PASS (Thổ/Thủy/Thổ) |
| Timeline 6 đại vận đầu (tên + ngày + số năm) | PASS | PASS | PASS |

### Công thức Lagna trên web

Web tính `norm(ascendant_tropical − ayanamsa)` (trong `app/swiss.ts`);
CLI tính `houses_ex(..., FLG_SIDEREAL)` → `ascmc[0]`. Đối chiếu trực tiếp
bằng pyswisseph cho 3 ca trên:

| Ca | CLI (sidereal) | Công thức web | Sai số |
|----|----------------|---------------|--------|
| A | 100.0105° | 100.0140° | 0.0036° PASS |
| B | 133.8944° | 133.8914° | 0.0030° PASS |
| C | 350.1153° | 350.1114° | 0.0039° PASS |

(Sai số dư ~0.003° đến từ cách nội suy ayanamsa giữa hai bản build
Swiss Ephemeris, không ảnh hưởng cung/nhà/nakshatra.)

## Quy ước đã chốt (hiển thị rõ trong UI)

- "Không nhớ giờ sinh": dùng Mặt Trăng lúc **12:00 trưa** ngày sinh theo
  múi giờ nơi sinh làm **Chandra Lagna**; nhãn "chưa xác minh giờ sinh" luôn
  đi kèm. Vimshottari vẫn đúng vì chỉ dựa vào Nakshatra của Mặt Trăng.
- Tọa độ tỉnh/thành trong dropdown là trung tâm hành chính (mức tương đối);
  người dùng cần chính xác dùng "Tự nhập tọa độ".

## Giới hạn đã biết

- Vị trí 9 graha trên web do `@swisseph/browser` (WASM) tính — cùng engine
  với site mô phỏng cũ, không thay đổi logic; phần port mới (dasha, navamsa,
  chuyển đổi ngày/giờ, công thức Lagna) đã đối chiếu ở trên.
- Chưa có: chia sẻ/in lá số, lớp quá cảnh đè lên lá số natal, bài viết
  kiến thức.

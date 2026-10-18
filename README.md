# Chiêm Tinh Ứng Dụng

Ứng dụng chiêm tinh Vệ Đà (Jyotish) cho đời sống, công việc, trading.

- **Bầu trời**: mô phỏng bầu trời 3D theo thời gian thực (Swiss Ephemeris,
  ayanāṃśa Lahiri, nhà Whole Sign, 27 Nakshatra).
- **Lá số của bạn**: nhập ngày/giờ/nơi sinh để lập lá số cá nhân — cung Mọc
  (Lagna), 9 graha, phân đồ Navamsa (D9), vận hạn Vimshottari 120 năm và
  diễn giải nhanh tự động. Mọi tính toán chạy 100% trên trình duyệt,
  không gửi dữ liệu đi đâu.

## Phát triển

```bash
npm install
npm run dev      # chạy local tại /
npm run build    # static export (thư mục out/)
npm test         # build + kiểm thử render
```

## Triển khai

Static export, publish qua GitHub Pages (repo `kimminhpro/Chiem-Tinh-Ung-Dung`).
Khi build trên GitHub Actions, `basePath` tự đặt thành `/Chiem-Tinh-Ung-Dung`.

## Phương pháp tính

Swiss Ephemeris (AGPL-3.0, https://www.astro.com/swisseph/) ·
ayanāṃśa Lahiri · nhà Whole Sign từ Lagna · Vimshottari từ Nakshatra của
Mặt Trăng · Rahu dùng Mean Node.

Trang đang được deploy tự động bằng GitHub Actions.

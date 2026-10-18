import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kimminhpro.github.io/Chiem-Tinh-Ung-Dung/"),
  title: "Chiêm Tinh Ứng Dụng — Jyotish Vệ Đà cho đời sống",
  description:
    "Lập lá số Vệ Đà cá nhân (D1/D9, Vimshottari), mô phỏng bầu trời 3D với Swiss Ephemeris, Lagna, Whole Sign, 27 Nakshatra. Ứng dụng chiêm tinh vào đời sống, công việc, trading.",
  openGraph: {
    title: "Chiêm Tinh Ứng Dụng — Jyotish Vệ Đà",
    description: "Lá số cá nhân · Bầu trời 3D · Vimshottari · Swiss Ephemeris",
  },
  twitter: {
    card: "summary",
    title: "Chiêm Tinh Ứng Dụng — Jyotish Vệ Đà",
    description: "Lá số cá nhân · Bầu trời 3D · Vimshottari · Swiss Ephemeris",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

/**
 * Mã hóa/giải mã thông tin lá số vào URL hash để chia sẻ.
 * Thuật toán thuần túy (không phụ thuộc React/DOM) để dễ kiểm thử độc lập.
 */

export type SharePayload = {
  name: string;
  birthDate: string;
  birthTime: string;
  unknownTime: boolean;
  placeId: string;
  customLat: string;
  customLon: string;
  tzInput: string;
};

const SHARE_VERSION = 1;
const MAX_TZ_LEN = 60;
const MAX_NAME_LEN = 80;

/** JSON -> base64url (an toàn cho URL hash, hỗ trợ tiếng Việt). */
export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify({ v: SHARE_VERSION, ...payload });
  // btoa chỉ nhận Latin-1: bọc qua encodeURIComponent để giữ Unicode.
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** base64url -> SharePayload. Hash sai/lạ -> null (bỏ qua lặng lẽ). */
export function decodeShare(hash: string): SharePayload | null {
  try {
    const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    const obj: unknown = JSON.parse(json);
    if (typeof obj !== "object" || obj === null) return null;
    const o = obj as Record<string, unknown>;
    if (typeof o.birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.birthDate))
      return null;
    if (typeof o.birthTime !== "string" || !/^\d{2}:\d{2}$/.test(o.birthTime))
      return null;
    if (typeof o.placeId !== "string" || o.placeId.length === 0) return null;
    if (typeof o.tzInput !== "string" || o.tzInput.length > MAX_TZ_LEN) return null;
    return {
      name: typeof o.name === "string" ? o.name.slice(0, MAX_NAME_LEN) : "",
      birthDate: o.birthDate,
      birthTime: o.birthTime,
      unknownTime: o.unknownTime === true,
      placeId: o.placeId,
      customLat: typeof o.customLat === "string" ? o.customLat.slice(0, 20) : "",
      customLon: typeof o.customLon === "string" ? o.customLon.slice(0, 20) : "",
      tzInput: o.tzInput,
    };
  } catch {
    return null;
  }
}

/** Tách payload từ location.hash dạng "#laso=...". */
export function parseShareHash(hash: string): SharePayload | null {
  if (!hash.startsWith("#laso=")) return null;
  return decodeShare(hash.slice(6));
}

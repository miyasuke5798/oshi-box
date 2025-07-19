import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 画像URLにキャッシュバスティング用のタイムスタンプを追加
 * @param url 画像URL
 * @returns キャッシュバスティング用のパラメータが追加されたURL
 */
export function addCacheBuster(url: string): string {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
}

/**
 * Firebase Storageの署名付きURLが有効かどうかをチェック
 * @param url 署名付きURL
 * @returns 有効期限が切れている場合はtrue
 */
export function isSignedUrlExpired(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get("X-Goog-Expires");
    if (!expiresParam) return false;

    const expiresTime = parseInt(expiresParam);
    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime > expiresTime;
  } catch (error) {
    console.error("Error checking signed URL expiration:", error);
    return false;
  }
}

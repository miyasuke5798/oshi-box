import { format } from "date-fns";

/**
 * 推しを始めた日から現在までの日数を計算する
 * @param oshiStartedAt - 推しを始めた日（文字列またはTimestampオブジェクト）
 * @returns 日数（現在より未来の場合はnull）
 */
export function calculateOshiDays(
  oshiStartedAt: string | { _seconds: number; _nanoseconds: number } | null
): number | null {
  if (!oshiStartedAt) return null;

  try {
    let startDate: Date;

    // oshiStartedAtが文字列の場合
    if (typeof oshiStartedAt === "string") {
      startDate = new Date(oshiStartedAt);
    }
    // oshiStartedAtがTimestampオブジェクトの場合
    else if (
      typeof oshiStartedAt === "object" &&
      oshiStartedAt !== null &&
      "_seconds" in oshiStartedAt &&
      "_nanoseconds" in oshiStartedAt
    ) {
      const timestamp = oshiStartedAt as {
        _seconds: number;
        _nanoseconds: number;
      };
      startDate = new Date(
        timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
      );
    } else {
      return null;
    }

    const now = new Date();

    // 現在より未来の場合はnullを返す
    if (startDate > now) {
      return null;
    }

    // 日数を計算（時間を無視して日付のみで計算）
    const startDateOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const nowDateOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const diffTime = nowDateOnly.getTime() - startDateOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error("Error calculating oshi days:", error, oshiStartedAt);
    return null;
  }
}

/**
 * 推しを始めた日をフォーマットする
 * @param oshiStartedAt - 推しを始めた日（文字列またはTimestampオブジェクト）
 * @param formatString - フォーマット文字列（デフォルト: "yyyy/MM/dd"）
 * @returns フォーマットされた日付文字列
 */
export function formatOshiStartedAt(
  oshiStartedAt: string | { _seconds: number; _nanoseconds: number } | null,
  formatString: string = "yyyy/MM/dd"
): string | null {
  if (!oshiStartedAt) return null;

  try {
    let date: Date;

    // oshiStartedAtが文字列の場合
    if (typeof oshiStartedAt === "string") {
      date = new Date(oshiStartedAt);
    }
    // oshiStartedAtがTimestampオブジェクトの場合
    else if (
      typeof oshiStartedAt === "object" &&
      oshiStartedAt !== null &&
      "_seconds" in oshiStartedAt &&
      "_nanoseconds" in oshiStartedAt
    ) {
      const timestamp = oshiStartedAt as {
        _seconds: number;
        _nanoseconds: number;
      };
      date = new Date(
        timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
      );
    } else {
      return null;
    }

    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting oshiStartedAt:", error, oshiStartedAt);
    return null;
  }
}

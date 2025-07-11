import { calculateOshiDays } from "@/lib/utils/date-utils";

interface OshiDaysBadgeProps {
  oshiStartedAt: string | { _seconds: number; _nanoseconds: number } | null;
  className?: string;
  showLabel?: boolean; // 「推して」のラベルを表示するかどうか
}

export function OshiDaysBadge({
  oshiStartedAt,
  className = "",
  showLabel = true,
}: OshiDaysBadgeProps) {
  const days = calculateOshiDays(oshiStartedAt);

  // 日数が計算できない場合（null、未来の日付など）は何も表示しない
  if (days === null) {
    return null;
  }

  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      {showLabel && `推して${days}日`}
    </span>
  );
}

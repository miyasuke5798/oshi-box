export interface Oshi {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string; // 推しの画像URL
  oshiColor?: string | null; // 推しの色（HEX形式: #RRGGBB、未選択の場合はnull）
  oshiStartedAt?:
    | string
    | {
        _seconds: number;
        _nanoseconds: number;
      }; // 推しを始めた日時（文字列またはFirestore Timestamp）
}

export interface CreateOshiRequest {
  name: string;
}

export interface CreateOshiResponse {
  success: boolean;
  oshiId: string;
  name: string;
}

export interface GetOshiListResponse {
  oshiList: Oshi[];
}

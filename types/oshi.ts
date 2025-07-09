export interface Oshi {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  oshiStartedAt: string; // 推しを始めた日時
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

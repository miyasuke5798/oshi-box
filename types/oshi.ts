export interface Oshi {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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

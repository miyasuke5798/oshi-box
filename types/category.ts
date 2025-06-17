export interface Category {
  id: string;
  name: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
}

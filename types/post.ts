export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: "public" | "followers" | "private";
  categories: string[];
  oshiId: string | null;
  images: string[];
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
}

export interface PostParams {
  userId: string;
  title: string;
  content: string;
  visibility: "public" | "followers" | "private";
  categories: string[];
  oshiId: string | null;
  images: string[];
}

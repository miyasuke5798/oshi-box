import { UserData } from "./user";
import { Oshi } from "./oshi";

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: "public" | "private";
  categories: string[];
  oshiId: string | null;
  oshi?: Oshi | null;
  images: string[];
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
  user: UserData;
}

export interface PostParams {
  userId: string;
  title: string;
  content: string;
  visibility: "public" | "private";
  categories: string[];
  oshiId: string | null;
  images: string[];
}

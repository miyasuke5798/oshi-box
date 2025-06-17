import { Timestamp } from "firebase-admin/firestore";

export interface Category {
  id: string;
  name: string;
  createdAt: Timestamp | null;
}

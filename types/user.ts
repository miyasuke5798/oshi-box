import { Timestamp } from "firebase-admin/firestore";

export interface UserData {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  bio: string | null;
  oshiName: string | null;
  snsLink: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserParams {
  slug: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp | null;
}

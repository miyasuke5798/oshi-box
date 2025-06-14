export interface UserData {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserParams {
  slug: string;
}

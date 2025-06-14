import { requireAuth } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { SettingsProfileClient } from "./client";
import { UserData } from "@/types/user";

export default async function SettingsProfilePage() {
  const session = await requireAuth();
  const userDoc = await adminDb?.collection("users").doc(session.uid).get();

  if (!userDoc?.exists) {
    throw new Error("ユーザーが見つかりません");
  }

  const userData = userDoc.data() as UserData;
  const serializedUserData: UserData = {
    ...userData,
    createdAt:
      userData.createdAt instanceof Date
        ? userData.createdAt
        : new Date(userData.createdAt),
    updatedAt:
      userData.updatedAt instanceof Date
        ? userData.updatedAt
        : new Date(userData.updatedAt),
  };

  return <SettingsProfileClient userData={serializedUserData} />;
}

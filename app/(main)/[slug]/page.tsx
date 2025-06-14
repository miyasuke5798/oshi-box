import { requireAuth } from "@/lib/auth-server";
import { SlugPageClient } from "./client";
import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { UserData } from "@/types/user";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SlugPage({ params }: PageProps) {
  // 認証チェックとセッション情報の取得
  const session = await requireAuth();
  const { slug } = await params;

  // ユーザー情報を取得
  const userRef = adminDb?.collection("users").doc(slug);
  const userDoc = await userRef?.get();

  if (!userDoc?.exists) {
    notFound();
  }

  // Firestoreのデータをシリアライズ可能な形式に変換
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

  // 現在のユーザーが表示対象のユーザーと一致するかどうかを判定
  const isCurrentUser = session.uid === slug;

  return (
    <SlugPageClient
      params={{ slug }}
      userData={serializedUserData}
      isCurrentUser={isCurrentUser}
    />
  );
}

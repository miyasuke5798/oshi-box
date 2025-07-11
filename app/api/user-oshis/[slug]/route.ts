import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = slug;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // ユーザーが存在するかチェック
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // ユーザーの推し一覧を取得
    const oshiSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("oshi")
      .orderBy("createdAt", "desc")
      .get();

    const oshiList = oshiSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        imageUrl: data.imageUrl || null,
        oshiColor: data.oshiColor || null,
        oshiStartedAt: data.oshiStartedAt || null,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    console.log("API - Successfully fetched user oshi list:", {
      count: oshiList.length,
      userId: userId,
    });

    return NextResponse.json({ oshiList });
  } catch (error) {
    console.error("Error fetching user oshi list:", error);
    return NextResponse.json(
      { error: "推し一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

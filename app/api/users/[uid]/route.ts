import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const session = await requireAuth();

    // 自分のプロフィールのみ更新可能
    if (session.uid !== uid) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { name, bio, oshiName, snsLink } = await request.json();

    // プロフィール情報を更新
    await adminDb?.collection("users").doc(uid).update({
      displayName: name,
      bio,
      oshiName,
      snsLink,
      updatedAt: new Date(),
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    return NextResponse.json(
      { error: "プロフィールの更新に失敗しました" },
      { status: 500 }
    );
  }
}

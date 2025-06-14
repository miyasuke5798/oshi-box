import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";

export async function PUT(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const session = await requireAuth();

    // 自分のプロフィールのみ更新可能
    if (session.uid !== params.uid) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const data = await request.json();
    const { name, bio, oshiName, snsLink } = data;

    // プロフィール情報を更新
    await adminDb?.collection("users").doc(params.uid).update({
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

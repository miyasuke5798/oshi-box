import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const oshiId = id;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // 推しが存在するかチェック
    const oshiDoc = await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .doc(oshiId)
      .get();

    if (!oshiDoc.exists) {
      return NextResponse.json(
        { error: "推しが見つかりません" },
        { status: 404 }
      );
    }

    // この推しに関連する投稿があるかチェック
    const postsSnapshot = await adminDb
      .collection("posts")
      .where("oshiId", "==", oshiId)
      .get();

    if (!postsSnapshot.empty) {
      return NextResponse.json(
        { error: "この推しに関連する投稿があるため削除できません" },
        { status: 400 }
      );
    }

    // 推しを削除
    await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .doc(oshiId)
      .delete();

    console.log("API - Successfully deleted oshi:", {
      oshiId,
      userId: session.uid,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting oshi:", error);
    return NextResponse.json(
      { error: "推しの削除に失敗しました" },
      { status: 500 }
    );
  }
}

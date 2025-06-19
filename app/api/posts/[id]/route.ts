import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const postId = params.id;

    console.log("API - Deleting post:", postId);

    if (!adminStorage || !adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // 投稿データを取得
    const postDoc = await adminDb.collection("posts").doc(postId).get();

    if (!postDoc.exists) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    const postData = postDoc.data();

    // 投稿の所有者かチェック
    if (postData?.userId !== session.uid) {
      return NextResponse.json(
        { error: "投稿の削除権限がありません" },
        { status: 403 }
      );
    }

    // 画像がある場合はStorageから削除
    if (postData?.images && postData.images.length > 0) {
      const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

      console.log(
        "API - Deleting images from storage:",
        postData.images.length
      );

      for (const imageUrl of postData.images) {
        try {
          // URLからファイルパスを抽出
          const urlParts = imageUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `posts/${session.uid}/${fileName}`;

          console.log("API - Deleting image file:", filePath);

          // Storageからファイルを削除
          await bucket.file(filePath).delete();
          console.log("API - Successfully deleted image:", filePath);
        } catch (error) {
          console.error("API - Error deleting image:", error);
          // 画像削除に失敗しても投稿削除は続行
        }
      }
    }

    // Firestoreから投稿を削除
    await adminDb.collection("posts").doc(postId).delete();

    console.log("API - Successfully deleted post:", postId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "投稿の削除に失敗しました" },
      { status: 500 }
    );
  }
}

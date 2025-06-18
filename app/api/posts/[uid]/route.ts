import { db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const data = await request.json();

    // 画像の処理
    const imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      const storage = getStorage();
      const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

      for (const image of data.images) {
        if (image.startsWith("data:image/")) {
          // Base64画像の場合、Firebase Storageに保存
          const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const fileName = `posts/${uid}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.jpg`;
          const file = bucket.file(fileName);

          await file.save(buffer, {
            metadata: {
              contentType: "image/jpeg",
            },
          });

          imageUrls.push(fileName); // パスを保存
        } else if (image.startsWith("http")) {
          // 既存のURLの場合、そのまま保持
          imageUrls.push(image);
        } else {
          // ファイルパスの場合、そのまま保持
          imageUrls.push(image);
        }
      }
    }

    await db
      .collection("posts")
      .doc(uid)
      .update({
        ...data,
        images: imageUrls,
        updatedAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

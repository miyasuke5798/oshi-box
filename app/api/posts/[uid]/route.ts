import { db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";

// 署名付きURLからファイルパスを抽出する関数
function extractFilePathFromSignedUrl(signedUrl: string): string | null {
  try {
    // Firebase Storageの署名付きURLの形式を解析
    const url = new URL(signedUrl);

    // パスからファイルパスを抽出
    // 例: /posts/userId/filename.jpg から posts/userId/filename.jpg を取得
    const pathParts = url.pathname.split("/");
    if (pathParts.length >= 3) {
      // 最初の空文字列を除いて、posts/userId/filename.jpg の部分を取得
      return pathParts.slice(1).join("/");
    }

    return null;
  } catch (error) {
    console.error("Error extracting file path from signed URL:", error);
    return null;
  }
}

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
          // 既存のURLの場合、署名付きURLかどうかをチェック
          const filePath = extractFilePathFromSignedUrl(image);
          if (filePath) {
            // 署名付きURLの場合はファイルパスを保存
            imageUrls.push(filePath);
          } else {
            // 通常のURLの場合はそのまま保持
            imageUrls.push(image);
          }
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

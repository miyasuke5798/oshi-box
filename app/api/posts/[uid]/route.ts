import { db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { requireAuth } from "@/lib/auth-server";

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

// ファイルパスを正規化する関数
function normalizeFilePath(filePath: string): string {
  // 署名付きURLの場合はファイルパスを抽出
  if (filePath.startsWith("http")) {
    const extractedPath = extractFilePathFromSignedUrl(filePath);
    return extractedPath || filePath;
  }
  return filePath;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const session = await requireAuth();
    const data = await request.json();

    // 投稿の所有者かチェック
    const postDoc = await db.collection("posts").doc(uid).get();
    if (!postDoc.exists) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    const postData = postDoc.data();
    if (postData?.userId !== session.uid) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const storage = getStorage();
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

    // 削除された画像をFirebase Storageから削除
    if (data.deletedImages && data.deletedImages.length > 0) {
      const deletePromises = data.deletedImages.map(
        async (imagePath: string) => {
          try {
            const normalizedPath = normalizeFilePath(imagePath);
            const file = bucket.file(normalizedPath);
            await file.delete();
            console.log(`Deleted image: ${normalizedPath}`);
          } catch (error) {
            console.error(`Error deleting image ${imagePath}:`, error);
            // 削除に失敗しても処理を続行
          }
        }
      );

      await Promise.all(deletePromises);
    }

    // 画像の処理
    const imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      for (const image of data.images) {
        if (image.startsWith("data:image/")) {
          // Base64画像の場合、Firebase Storageに保存
          const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const fileName = `posts/${session.uid}/${Date.now()}-${Math.random()
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

    await db.collection("posts").doc(uid).update({
      title: data.title,
      content: data.content,
      visibility: data.visibility,
      categories: data.categories,
      oshiId: data.oshiId,
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const session = await requireAuth();

    // 投稿の所有者かチェック
    const postDoc = await db.collection("posts").doc(uid).get();
    if (!postDoc.exists) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    const postData = postDoc.data();
    if (postData?.userId !== session.uid) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // 投稿に含まれる画像をFirebase Storageから削除
    if (postData.images && postData.images.length > 0) {
      const storage = getStorage();
      const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

      const deletePromises = postData.images.map(async (imagePath: string) => {
        try {
          const normalizedPath = normalizeFilePath(imagePath);
          const file = bucket.file(normalizedPath);
          await file.delete();
          console.log(`Deleted image: ${normalizedPath}`);
        } catch (error) {
          console.error(`Error deleting image ${imagePath}:`, error);
          // 削除に失敗しても処理を続行
        }
      });

      await Promise.all(deletePromises);
    }

    // Firestoreから投稿を削除
    await db.collection("posts").doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

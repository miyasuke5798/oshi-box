import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const data = await request.json();

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    console.log("API - Received data:", {
      title: data.title,
      imagesCount: data.images?.length || 0,
      deletedImagesCount: data.deletedImages?.length || 0,
      deletedImages: data.deletedImages,
    });

    // 投稿の所有者かチェック
    const postDoc = await adminDb.collection("posts").doc(id).get();
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

    console.log("API - Current post images:", postData.images);

    const storage = getStorage();
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

    // 削除された画像をFirebase Storageから削除
    if (data.deletedImages && data.deletedImages.length > 0) {
      console.log("API - Deleting images from storage:", data.deletedImages);
      const deletePromises = data.deletedImages.map(
        async (imagePath: string) => {
          try {
            const normalizedPath = normalizeFilePath(imagePath);
            console.log(`API - Deleting storage file: ${normalizedPath}`);
            const file = bucket.file(normalizedPath);
            await file.delete();
            console.log(`API - Successfully deleted image: ${normalizedPath}`);
          } catch (error) {
            console.error(`API - Error deleting image ${imagePath}:`, error);
            // 削除に失敗しても処理を続行
          }
        }
      );

      await Promise.all(deletePromises);
    }

    // 画像の処理
    const imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      console.log("API - Processing images:", data.images);
      console.log("API - Images count:", data.images.length);

      for (let i = 0; i < data.images.length; i++) {
        const image = data.images[i];
        console.log(`API - Processing image ${i + 1}/${data.images.length}:`, {
          type: typeof image,
          isBase64:
            typeof image === "string" && image.startsWith("data:image/"),
          isUrl: typeof image === "string" && image.startsWith("http"),
          isPath:
            typeof image === "string" &&
            !image.startsWith("data:image/") &&
            !image.startsWith("http"),
        });

        if (image.startsWith("data:image/")) {
          // Base64画像の場合、Firebase Storageに保存
          console.log(`API - Converting base64 image ${i + 1} to storage`);
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
          console.log(`API - Added new image: ${fileName}`);
        } else if (image.startsWith("http")) {
          // 既存のURLの場合、署名付きURLかどうかをチェック
          const filePath = extractFilePathFromSignedUrl(image);
          if (filePath) {
            // 署名付きURLの場合はファイルパスを保存
            imageUrls.push(filePath);
            console.log(
              `API - Added existing image (from signed URL): ${filePath}`
            );
          } else {
            // 通常のURLの場合はそのまま保持
            imageUrls.push(image);
            console.log(`API - Added existing image (external URL): ${image}`);
          }
        } else {
          // ファイルパスの場合、そのまま保持
          imageUrls.push(image);
          console.log(`API - Added existing image (file path): ${image}`);
        }
      }
    }

    console.log("API - Final images to save to Firestore:", imageUrls);
    console.log("API - Images count comparison:", {
      original: postData.images?.length || 0,
      final: imageUrls.length,
      deleted: data.deletedImages?.length || 0,
    });

    // Firestoreの更新データを準備
    const updateData = {
      title: data.title,
      content: data.content,
      visibility: data.visibility,
      categories: data.categories,
      oshiId: data.oshiId,
      images: imageUrls,
      updatedAt: new Date(),
    };

    console.log("API - Updating Firestore with data:", updateData);

    await adminDb.collection("posts").doc(id).update(updateData);

    console.log("API - Successfully updated post in Firestore");

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const postId = id;

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

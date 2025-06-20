import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";
import { PostParams } from "@/types/post";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { title, content, visibility, categories, oshiId, images } =
      await request.json();

    console.log("API - Creating new post:", {
      title,
      oshiId,
      imagesCount: images?.length || 0,
      categoriesCount: categories?.length || 0,
    });

    if (!adminStorage || !adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // 推しIDの検証（存在する場合）
    if (oshiId) {
      const oshiDoc = await adminDb
        .collection("users")
        .doc(session.uid)
        .collection("oshi")
        .doc(oshiId)
        .get();

      if (!oshiDoc.exists) {
        return NextResponse.json(
          { error: "指定された推しが見つかりません" },
          { status: 400 }
        );
      }
    }

    // 画像のアップロード処理
    const uploadedImageUrls: string[] = [];
    if (images && images.length > 0) {
      const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

      console.log("API - Processing images for new post:", images.length);

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`API - Processing image ${i + 1}/${images.length}:`, {
          type: typeof image,
          isBase64:
            typeof image === "string" && image.startsWith("data:image/"),
        });

        // Base64画像データをバッファに変換
        const base64Data = image.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        // 一意のファイル名を生成
        const fileName = `posts/${session.uid}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.jpg`;

        console.log(`API - Uploading image ${i + 1} to: ${fileName}`);

        // 画像をアップロード
        await bucket.file(fileName).save(buffer, {
          metadata: {
            contentType: "image/jpeg",
          },
        });

        // ファイルパスを保存（署名付きURLではなく）
        uploadedImageUrls.push(fileName);
        console.log(`API - Successfully uploaded image ${i + 1}: ${fileName}`);
      }
    }

    console.log("API - Final uploaded image URLs:", uploadedImageUrls);

    // 投稿データを作成
    const postData: PostParams = {
      userId: session.uid,
      title,
      content,
      visibility,
      categories,
      oshiId,
      images: uploadedImageUrls,
    };

    // Firestoreに保存
    const docRef = await adminDb.collection("posts").add({
      ...postData,
      createdAt: new Date(),
      updatedAt: null,
    });

    console.log("API - Successfully created post:", {
      postId: docRef.id,
      oshiId,
      userId: session.uid,
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    );
  }
}

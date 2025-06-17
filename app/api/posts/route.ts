import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";
import { PostParams } from "@/types/post";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { title, content, visibility, categories, oshiId, images } =
      await request.json();

    if (!adminStorage || !adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // 画像のアップロード処理
    const uploadedImageUrls: string[] = [];
    if (images && images.length > 0) {
      const bucket = adminStorage.bucket(
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      );

      for (const image of images) {
        // Base64画像データをバッファに変換
        const base64Data = image.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        // 一意のファイル名を生成
        const fileName = `posts/${session.uid}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.jpg`;

        // 画像をアップロード
        await bucket.file(fileName).save(buffer, {
          metadata: {
            contentType: "image/jpeg",
          },
        });

        // 公開URLを取得
        const [url] = await bucket.file(fileName).getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });

        uploadedImageUrls.push(url);
      }
    }

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

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";

// Firebase Storageのエラー型を定義
interface FirebaseStorageError {
  code?: number;
  message?: string;
  status?: number;
}

export async function POST(
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

    if (!adminStorage) {
      return NextResponse.json(
        { error: "ストレージサービスが利用できません" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルがアップロードされていません" },
        { status: 400 }
      );
    }

    // ファイルのバリデーション
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルのみアップロード可能です" },
        { status: 400 }
      );
    }

    // Firebase Storageにアップロード
    const buffer = await file.arrayBuffer();

    // デバッグログ
    console.log("Storage initialization:", {
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    const bucket = adminStorage.bucket(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    );
    const fileName = `avatars/${uid}/profile.jpg`; // 固定のファイル名を使用
    const fileBuffer = Buffer.from(buffer);

    try {
      // 既存の画像を削除
      const existingFile = bucket.file(fileName);
      try {
        await existingFile.delete();
      } catch (error) {
        // ファイルが存在しない場合は無視
        console.log("既存の画像が存在しません", error);
      }

      // 新しい画像をアップロード
      await bucket.file(fileName).save(fileBuffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // 公開URLを取得
      const [url] = await bucket.file(fileName).getSignedUrl({
        action: "read",
        expires: "03-01-2500", // 長期間有効なURL
      });

      // ユーザープロフィールを更新
      await adminDb?.collection("users").doc(uid).update({
        photoURL: url,
        updatedAt: new Date(),
      });

      return NextResponse.json({ status: "success", photoURL: url });
    } catch (storageError) {
      console.error("Storage error details:", storageError);
      return NextResponse.json(
        { error: "ストレージへのアップロードに失敗しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("プロフィール画像アップロードエラー:", error);
    return NextResponse.json(
      { error: "プロフィール画像のアップロードに失敗しました" },
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

    // 自分のプロフィールのみ更新可能
    if (session.uid !== uid) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    if (!adminStorage) {
      return NextResponse.json(
        { error: "ストレージサービスが利用できません" },
        { status: 503 }
      );
    }

    const bucket = adminStorage.bucket(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    );
    const fileName = `avatars/${uid}/profile.jpg`;

    try {
      // 画像を削除
      await bucket.file(fileName).delete();

      // ユーザープロフィールを更新
      await adminDb?.collection("users").doc(uid).update({
        photoURL: null,
        updatedAt: new Date(),
      });

      return NextResponse.json({ status: "success" });
    } catch (error) {
      // ファイルが存在しない場合は成功として扱う
      const storageError = error as FirebaseStorageError;
      if (storageError.code === 404) {
        // ユーザープロフィールを更新
        await adminDb?.collection("users").doc(uid).update({
          photoURL: null,
          updatedAt: new Date(),
        });
        return NextResponse.json({ status: "success" });
      }
      throw error;
    }
  } catch (error) {
    console.error("プロフィール画像削除エラー:", error);
    return NextResponse.json(
      { error: "プロフィール画像の削除に失敗しました" },
      { status: 500 }
    );
  }
}

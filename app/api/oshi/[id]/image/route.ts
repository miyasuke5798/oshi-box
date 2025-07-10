import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const oshiId = id;

    if (!adminDb || !adminStorage) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "画像ファイルが選択されていません" },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルを選択してください" },
        { status: 400 }
      );
    }

    // ファイル名を生成
    const fileExtension = file.name.split(".").pop();
    const fileName = `oshi-images/${
      session.uid
    }/${oshiId}/${Date.now()}.${fileExtension}`;

    // Firebase Storageにアップロード
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucketName =
      process.env.FIREBASE_STORAGE_BUCKET ||
      `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const fileRef = adminStorage.bucket(bucketName).file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 署名付きURLを生成（1年間有効）
    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1年
    });

    // 推しドキュメントに画像URLを保存
    await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .doc(oshiId)
      .update({
        imageUrl: signedUrl,
        updatedAt: new Date(),
      });

    console.log("API - Successfully uploaded oshi image:", {
      oshiId,
      fileName,
      userId: session.uid,
    });

    return NextResponse.json({
      success: true,
      imageUrl: signedUrl,
    });
  } catch (error) {
    console.error("Error uploading oshi image:", error);
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const oshiId = id;

    if (!adminDb || !adminStorage) {
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

    const oshiData = oshiDoc.data();
    const currentImageUrl = oshiData?.imageUrl;

    if (currentImageUrl) {
      // Firebase Storageから画像を削除
      try {
        const fileName = currentImageUrl.split("/").pop()?.split("?")[0];
        if (fileName) {
          const bucketName =
            process.env.FIREBASE_STORAGE_BUCKET ||
            `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
          const fileRef = adminStorage
            .bucket(bucketName)
            .file(`oshi-images/${session.uid}/${oshiId}/${fileName}`);
          await fileRef.delete();
        }
      } catch (error) {
        console.error("Error deleting image from storage:", error);
        // ストレージからの削除に失敗しても、DBからは削除を続行
      }
    }

    // 推しドキュメントから画像URLを削除
    await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .doc(oshiId)
      .update({
        imageUrl: null,
        updatedAt: new Date(),
      });

    console.log("API - Successfully deleted oshi image:", {
      oshiId,
      userId: session.uid,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting oshi image:", error);
    return NextResponse.json(
      { error: "画像の削除に失敗しました" },
      { status: 500 }
    );
  }
}

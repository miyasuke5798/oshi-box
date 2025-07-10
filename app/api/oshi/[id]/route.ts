import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-server";
import { z } from "zod";

// 推しのバリデーションスキーマ
const oshiSchema = z.object({
  name: z
    .string()
    .min(1, "推しの名前を入力してください")
    .max(50, "推しの名前は50文字以内で入力してください")
    .trim(),
  oshiStartedAt: z.string().min(1, "推しを始めた日を選択してください"),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const oshiId = id;
    const data = await request.json();

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // バリデーション実行
    const validatedData = oshiSchema.parse(data);

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

    // 同じ名前の推しが既に存在するかチェック（自分以外）
    const existingOshiQuery = await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .where("name", "==", validatedData.name)
      .get();

    const existingOshi = existingOshiQuery.docs.find(
      (doc) => doc.id !== oshiId
    );
    if (existingOshi) {
      return NextResponse.json(
        { error: "既に同じ名前の推しが登録されています" },
        { status: 400 }
      );
    }

    // 推しを更新
    // 日付文字列をローカルタイムゾーンでDateオブジェクトに変換
    const [year, month, day] = validatedData.oshiStartedAt
      .split("-")
      .map(Number);
    const oshiStartedAt = new Date(year, month - 1, day); // monthは0ベースなので-1

    await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .doc(oshiId)
      .update({
        name: validatedData.name,
        oshiStartedAt: oshiStartedAt,
        updatedAt: new Date(),
      });

    console.log("API - Successfully updated oshi:", {
      oshiId,
      name: validatedData.name,
      userId: session.uid,
    });

    return NextResponse.json({
      success: true,
      name: validatedData.name,
    });
  } catch (error) {
    console.error("Error updating oshi:", error);

    if (error instanceof z.ZodError) {
      const errorMessage =
        error.errors[0]?.message || "入力内容を確認してください";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(
      { error: "推しの更新に失敗しました" },
      { status: 500 }
    );
  }
}

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

    // 推しの画像がある場合は削除
    const oshiData = oshiDoc.data();
    if (oshiData?.imageUrl && adminStorage) {
      try {
        // imageUrlからファイルパスを抽出
        const urlParts = oshiData.imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1].split("?")[0]; // クエリパラメータを除去
        const filePath = `oshi-images/${session.uid}/${oshiId}/${fileName}`;

        await adminStorage
          .bucket(
            process.env.FIREBASE_STORAGE_BUCKET ||
              `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
          )
          .file(filePath)
          .delete();
        console.log("API - Successfully deleted oshi image:", filePath);
      } catch (error) {
        console.error("Error deleting oshi image:", error);
        // 画像削除に失敗しても推しの削除は続行
      }
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

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
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
  oshiColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "有効な色コードを入力してください")
    .optional(),
});

export async function GET() {
  try {
    const session = await requireAuth();

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // ユーザーの推し一覧を取得
    const oshiSnapshot = await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .orderBy("createdAt", "desc")
      .get();

    const oshiList = oshiSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("API - Successfully fetched oshi list:", {
      count: oshiList.length,
      userId: session.uid,
    });

    return NextResponse.json({ oshiList });
  } catch (error) {
    console.error("Error fetching oshi list:", error);
    return NextResponse.json(
      { error: "推し一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const data = await request.json();

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebaseの初期化に失敗しています" },
        { status: 500 }
      );
    }

    // バリデーション実行
    const validatedData = oshiSchema.parse(data);

    // ユーザーの推し数をチェック（3つまで）
    const existingOshisSnapshot = await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .get();

    if (existingOshisSnapshot.size >= 3) {
      return NextResponse.json(
        { error: "推しは3つまでしか作成できません" },
        { status: 400 }
      );
    }

    // ユーザーが既に同じ名前の推しを持っているかチェック
    const existingOshiQuery = await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .where("name", "==", validatedData.name)
      .get();

    if (!existingOshiQuery.empty) {
      return NextResponse.json(
        { error: "既に同じ名前の推しが登録されています" },
        { status: 400 }
      );
    }

    // 推しを新規作成
    const now = new Date();
    // 日付文字列をローカルタイムゾーンでDateオブジェクトに変換
    const [year, month, day] = validatedData.oshiStartedAt
      .split("-")
      .map(Number);
    const oshiStartedAt = new Date(year, month - 1, day); // monthは0ベースなので-1

    const oshiRef = await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("oshi")
      .add({
        name: validatedData.name,
        oshiColor: validatedData.oshiColor || null,
        createdAt: now,
        updatedAt: now,
        oshiStartedAt: oshiStartedAt, // 推しを始めた日時
      });

    console.log("API - Successfully created oshi:", {
      oshiId: oshiRef.id,
      name: validatedData.name,
      userId: session.uid,
    });

    return NextResponse.json(
      {
        success: true,
        oshiId: oshiRef.id,
        name: validatedData.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating oshi:", error);

    if (error instanceof z.ZodError) {
      const errorMessage =
        error.errors[0]?.message || "入力内容を確認してください";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(
      { error: "推しの登録に失敗しました" },
      { status: 500 }
    );
  }
}

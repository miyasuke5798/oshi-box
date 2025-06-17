import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();

    await db.collection("categories").doc(params.id).update({
      name,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "カテゴリーの更新に失敗しました" },
      { status: 500 }
    );
  }
}

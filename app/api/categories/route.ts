import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    const docRef = await db.collection("categories").add({
      name,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "カテゴリーの作成に失敗しました" },
      { status: 500 }
    );
  }
}

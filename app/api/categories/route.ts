import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getCategories } from "@/lib/firebase/admin";

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

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

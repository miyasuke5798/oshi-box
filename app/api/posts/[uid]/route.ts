import { db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const data = await request.json();

    await db
      .collection("posts")
      .doc(uid)
      .update({
        ...data,
        updatedAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

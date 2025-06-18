import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const file = bucket.file(path);

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24時間
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}

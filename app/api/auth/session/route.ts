import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    if (!adminAuth) {
      return NextResponse.json(
        { error: "認証サービスが利用できません" },
        { status: 503 }
      );
    }

    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7日間

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("セッション作成エラー:", error);
    return NextResponse.json(
      { error: "セッションの作成に失敗しました" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      maxAge: 0,
      path: "/",
    });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("セッション削除エラー:", error);
    return NextResponse.json(
      { error: "セッションの削除に失敗しました" },
      { status: 500 }
    );
  }
}

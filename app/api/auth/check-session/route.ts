import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await getSession();

    if (session) {
      return NextResponse.json({ isLoggedIn: true, user: session });
    } else {
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    console.error("セッション確認エラー:", error);
    return NextResponse.json({ isLoggedIn: false });
  }
}

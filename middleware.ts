import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 開発環境では認証をスキップ
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
    return NextResponse.next();
  }

  // Basic認証の認証情報を取得
  const basicAuth = request.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    // TODO: 環境変数にする?
    const validUser = "admin";
    const validPassword = "password";

    // 認証情報が一致するか確認
    if (user === validUser && pwd === validPassword) {
      return NextResponse.next();
    }
  }

  // 認証が必要な場合、401レスポンスを返す
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
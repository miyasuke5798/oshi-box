import { cookies } from "next/headers";
//import { auth } from "./firebase";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { redirect } from "next/navigation";

// Firebase Admin SDKの初期化
const apps = getApps();

if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value || "";

  if (!session) {
    return null;
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(session, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

export async function requireAuth(redirectTo: string = "/session/new") {
  const session = await getSession();

  if (!session) {
    redirect(`${redirectTo}?req=auth`);
  }

  return session;
}

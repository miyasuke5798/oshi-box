import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// 環境変数の存在チェック
const isFirebaseAdminConfigAvailable = () => {
  return (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
};

// Initialize Firebase Admin
const apps = getApps();

if (!apps.length && isFirebaseAdminConfigAvailable()) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

// 環境変数が設定されていない場合はnullを返す
export const adminAuth = isFirebaseAdminConfigAvailable() ? getAuth() : null;
export const adminDb = isFirebaseAdminConfigAvailable() ? getFirestore() : null;
export const adminStorage = isFirebaseAdminConfigAvailable()
  ? getStorage()
  : null;

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  Auth,
  User,
  NextOrObserver,
  Unsubscribe,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// 環境変数の存在チェック
const isFirebaseConfigAvailable = () => {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// ダミーの型定義
interface DummyAuth {
  signInWithPopup: () => Promise<{ user: null }>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (
    nextOrObserver: NextOrObserver<User | null>,
    error?: (error: Error) => void,
    completed?: () => void
  ) => Unsubscribe;
}

interface DummyFirestore {
  collection: () => DummyFirestore;
  doc: () => DummyFirestore;
  get: () => Promise<{ data: () => null }>;
}

interface DummyStorage {
  ref: () => DummyStorage;
  uploadBytes: () => Promise<{
    ref: { getDownloadURL: () => Promise<string> };
  }>;
}

// Firebaseの初期化を条件付きで行う
let app;
let auth: Auth | DummyAuth;
let db: Firestore | DummyFirestore;
let storage: FirebaseStorage | DummyStorage;

if (isFirebaseConfigAvailable()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.warn(
    "Firebaseの環境変数が設定されていません。Firebase機能は無効化されます。"
  );
  // ダミーのオブジェクトを提供
  auth = {
    signInWithPopup: async () => ({ user: null }),
    signOut: async () => {},
    onAuthStateChanged: (nextOrObserver) => {
      if (typeof nextOrObserver === "function") {
        nextOrObserver(null);
      }
      return () => {};
    },
  } as DummyAuth;

  db = {
    collection: () => db as DummyFirestore,
    doc: () => db as DummyFirestore,
    get: async () => ({ data: () => null }),
  } as DummyFirestore;

  storage = {
    ref: () => storage as DummyStorage,
    uploadBytes: async () => ({
      ref: { getDownloadURL: async () => "" },
    }),
  } as DummyStorage;
}

export { auth, db, storage };
export default app;

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!auth) {
      console.error("Firebaseの初期化に失敗しています");
      return;
    }

    try {
      await auth.signOut();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return { user, loading, signOut };
};

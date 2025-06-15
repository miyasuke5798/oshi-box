import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserData } from "@/types/user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      setUser(user);

      if (user) {
        try {
          // ユーザーデータを取得
          const response = await fetch(`/api/users/${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("ユーザーデータの取得に失敗しました:", error);
        }
      } else {
        setUserData(null);
      }

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

  return { user, userData, loading, signOut };
};

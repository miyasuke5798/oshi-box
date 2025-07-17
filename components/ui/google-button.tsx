"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { AlertCircle } from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface GoogleButtonProps {
  redirectPath?: string;
}

export const GoogleButton = ({ redirectPath }: GoogleButtonProps) => {
  const router = useRouter();

  const handleClick = async () => {
    if (!auth || !db) {
      toast.error("Firebaseの初期化に失敗しています", {
        icon: <AlertCircle />,
      });
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        // ユーザー情報をFirestoreに保存/更新
        const userRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // 新規ユーザーの場合
          await setDoc(userRef, {
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            provider: "google", // プロバイダー情報を追加
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setTimeout(() => {
            toast.success("登録に成功しました", { icon: <SuccessCircle /> });
          }, 500);
        } else {
          // 既存ユーザーの場合（同じプロバイダーでの再ログイン）
          // 既存データを保持し、必要な情報のみ更新
          const existingData = userDoc.data();
          await setDoc(
            userRef,
            {
              ...existingData, // 既存データを保持
              displayName: existingData.displayName || result.user.displayName, // 既存の名前がない場合のみ更新
              email: existingData.email || result.user.email, // 既存のメールがない場合のみ更新
              provider: "google",
              updatedAt: new Date(),
            },
            { merge: true }
          );
          setTimeout(() => {
            toast.success("ログインしました", { icon: <SuccessCircle /> });
          }, 500);
        }

        // セッションクッキーを設定
        const idToken = await result.user.getIdToken();
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("セッションの設定に失敗しました");
        }

        // リダイレクト先を決定
        const finalRedirectPath = redirectPath || `/${result.user.uid}`;
        router.push(finalRedirectPath);
      }
    } catch (error) {
      console.error("認証エラー:", error);
      toast.error("認証に失敗しました", {
        icon: <AlertCircle />,
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 hover:shadow-lg font-normal text-base flex items-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Googleで続ける
    </Button>
  );
};

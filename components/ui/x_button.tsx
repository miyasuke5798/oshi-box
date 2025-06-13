"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { XIcon } from "@/components/svg/x_icon";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";
import { AlertCircle } from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const XButton = () => {
  const router = useRouter();

  const handleClick = async () => {
    if (!auth || !db) {
      toast.error("Firebaseの初期化に失敗しています", {
        icon: <AlertCircle />,
      });
      return;
    }

    try {
      const provider = new TwitterAuthProvider();
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
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          toast.success("登録に成功しました", { icon: <SuccessCircle /> });
        } else {
          // 既存ユーザーの場合
          await setDoc(
            userRef,
            {
              ...userDoc.data(),
              updatedAt: new Date(),
            },
            { merge: true }
          );
          toast.success("ログインしました", { icon: <SuccessCircle /> });
        }

        router.push(`/${result.user.uid}`);
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
      className="bg-[#000000] hover:bg-[#000000] hover:shadow-lg font-normal text-base flex items-center gap-2"
    >
      <XIcon />
      Xで続ける
    </Button>
  );
};

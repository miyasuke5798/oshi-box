"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { XIcon } from "@/components/svg/x_icon";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";

export const XButton = () => {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const provider = new TwitterAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        router.push("/xxx"); // TODO:ログイン後のリダイレクト先を設定
        if (result.operationType === "signIn") {
          toast.success("ログインしました", { icon: <SuccessCircle /> });
        } else {
          toast.success("登録に成功しました", { icon: <SuccessCircle /> });
        }
      }
    } catch (error) {
      console.error("認証エラー:", error);
      toast.error("認証に失敗しました");
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

"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { XIcon } from "@/components/svg/x_icon";
import { useRouter } from "next/navigation";

type XButtonProps = {
  type: "login" | "register";
};

export const XButton = ({ type }: XButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    const randomString = "xxx";
    router.push(`/${randomString}`);
    if (type === "login") {
      toast.success("ログインしました", { icon: <SuccessCircle /> });
    } else if (type === "register") {
      toast.success("登録に成功しました", { icon: <SuccessCircle /> });
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

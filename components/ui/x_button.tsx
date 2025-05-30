"use client";
import { Button } from "@/components/ui/button";
import { XIcon } from "@/components/svg/x_icon";
import { useRouter } from "next/navigation";

// 簡易的にランダムなslugを生成する関数
const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const XButton = () => {
  const router = useRouter();

  const handleClick = () => {
    const randomString = generateRandomString(8);
    router.push(`/${randomString}`);
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

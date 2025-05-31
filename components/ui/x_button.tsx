"use client";
import { Button } from "@/components/ui/button";
import { XIcon } from "@/components/svg/x_icon";
import { useRouter } from "next/navigation";

export const XButton = () => {
  const router = useRouter();

  const handleClick = () => {
    const randomString = "xxx";
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

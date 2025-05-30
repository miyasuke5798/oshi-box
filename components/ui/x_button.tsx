import { Button } from "@/components/ui/button";
import { XIcon } from "@/components/svg/x_icon";

export const XButton = () => (
  <Button className="bg-[#000000] hover:bg-[#000000] hover:shadow-lg font-normal text-base flex items-center gap-2">
    <XIcon />
    Xで続ける
  </Button>
);

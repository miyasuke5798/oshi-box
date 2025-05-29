"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserIcon } from "@/components/svg/UserIcon";

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow z-50">
      <div className="container px-3 sm:px-0">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold">
              oshi box
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
                <UserIcon className="w-8 h-8" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/" className="w-full">
                    推しボックスとは？
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="w-full">
                    よくある質問
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent">
                  <Link href="/users/new" className="w-full">
                    <Button className="w-full" variant="default">
                      新規登録
                    </Button>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent">
                  <Link href="/session/new" className="w-full">
                    <Button className="w-full" variant="default">
                      ログイン
                    </Button>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { FaUsers, FaList, FaTags } from "react-icons/fa";
import { Menu, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export const AdminSideMenu = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "ユーザー一覧",
      href: "/admin/dashboard/users",
      icon: <FaUsers size={20} />,
    },
    {
      label: "投稿一覧",
      href: "/admin/dashboard/posts",
      icon: <FaList size={20} />,
    },
    {
      label: "カテゴリー一覧",
      href: "/admin/dashboard/categories",
      icon: <FaTags size={20} />,
    },
    {
      label: "推し一覧",
      href: "/admin/dashboard/oshis",
      icon: <UsersRound size={20} />,
    },
  ];

  const MenuContent = () => (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">管理画面</h1>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-400"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-8 pt-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        >
          <HiHome size={20} />
          <span>ホームへ</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* スマホサイズ用のシートメニュー */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">管理メニュー</SheetTitle>
            <MenuContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* PCサイズ用のサイドメニュー */}
      <div className="hidden sm:block w-64 min-h-screen bg-white border-r">
        <MenuContent />
      </div>
    </>
  );
};

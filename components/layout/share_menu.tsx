"use client";
import { HiHome } from "react-icons/hi";
import { BsFillSendFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export const ShareMenu: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    {
      label: "マイページ",
      href: user ? `/${user.uid}` : "/",
      icon: <HiHome size={26} color="#3ebff5" />,
    },
    {
      label: "投稿する",
      href: "/users/posts/new",
      icon: <BsFillSendFill size={26} color="#3ebff5" />,
    },
    {
      label: "みんなの投稿",
      href: "/posts",
      icon: <FaSearch size={26} color="#3ebff5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] z-50">
      <div className="container pb-4">
        <ul className="px-3 py-3 flex justify-between gap-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label} className="w-full max-w-[120px]">
                <Link
                  href={item.href}
                  className="flex flex-col items-center w-full gap-1"
                >
                  {item.icon}
                  <div
                    className={
                      isActive
                        ? "bg-[#3ebff5] text-white flex items-center justify-center text-[10px] h-[23px] w-full rounded-sm"
                        : "text-[#3ebff5] flex items-center justify-center text-[10px] h-[23px] w-full rounded-sm"
                    }
                  >
                    {item.label}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

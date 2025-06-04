"use client";
import { HiHome } from "react-icons/hi";
import { BsFillSendFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const ShareMenu: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "マイページ",
      href: "/xxx",
      icon: <HiHome size={26} color="#3ebff5" />,
    },
    {
      label: "投稿する",
      href: "/users/posts",
      icon: <BsFillSendFill size={26} color="#3ebff5" />,
    },
    {
      label: "みんなの投稿",
      href: "/posts",
      icon: <FaSearch size={26} color="#3ebff5" />,
    },
  ];

  return (
    <ul className="px-3 sm:px-0 py-4 grid grid-cols-4 gap-3">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.label}>
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
  );
};

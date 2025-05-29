import * as React from "react";

export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* 外側のグレー円 */}
    <circle cx="16" cy="16" r="16" fill="#E5E7EB" />
    {/* 肩 */}
    <path d="M4 32a12 12 0 0 1 24 0" fill="#fff" />
    {/* 顔の外枠（背景色） */}
    <circle
      cx="16"
      cy="14"
      r="7"
      fill="#fff"
      stroke="#E5E7EB"
      strokeWidth="2"
    />
  </svg>
);

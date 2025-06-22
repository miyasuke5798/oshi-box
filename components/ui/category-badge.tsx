"use client";

import { useRouter } from "next/navigation";

interface CategoryBadgeProps {
  categoryId: string;
  categoryName: string;
}

export function CategoryBadge({
  categoryId,
  categoryName,
}: CategoryBadgeProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/search?category=${categoryId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center rounded-full border border-transparent bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors"
    >
      {categoryName}
    </button>
  );
}

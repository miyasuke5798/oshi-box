import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
}

export const Loading = ({ className }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-200 border-t-[#3ebff5]",
          "w-12 h-12",
          className
        )}
      />
    </div>
  );
};

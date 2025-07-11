"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  disabled = false,
  className = "",
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // プリセットカラー
  const presetColors = [
    "#FF6B6B", // 赤
    "#4ECDC4", // シアン
    "#45B7D1", // 青
    "#96CEB4", // 緑
    "#FFEAA7", // 黄色
    "#DDA0DD", // 紫
    "#FFB347", // オレンジ
    "#98D8C8", // ミント
    "#F7DC6F", // ゴールド
    "#BB8FCE", // ラベンダー
    "#85C1E9", // スカイブルー
    "#F8C471", // サンフラワー
    "#E74C3C", // レッド
    "#2ECC71", // エメラルド
    "#9B59B6", // アメジスト
    "#E67E22", // カボチャ
  ];

  // 外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // カラーピッカー内のクリックは無視
      if (target && (target as Element).closest(".react-colorful")) {
        return;
      }

      // Dialog内のクリックは無視
      if (target && (target as Element).closest('[role="dialog"]')) {
        return;
      }

      if (triggerRef.current && !triggerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={`w-12 h-10 border border-gray-300 rounded cursor-pointer transition-colors hover:border-gray-400 relative ${className}`}
          style={{ backgroundColor: value || "#f3f4f6" }}
          title="色を選択"
        >
          {!value && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-medium">
              なし
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        className="p-3 w-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">色を選択</DialogTitle>
        <HexColorPicker
          color={value || "#3B82F6"}
          onChange={onChange}
          className="w-48 h-48"
        />
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">プリセットカラー:</p>
          <div className="grid grid-cols-8 gap-1">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">色コード:</span>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            className="text-sm border border-gray-300 rounded px-2 py-1 w-20"
            placeholder="#000000"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

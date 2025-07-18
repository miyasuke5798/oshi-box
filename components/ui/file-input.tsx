"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Upload } from "lucide-react";

interface FileInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string;
  className?: string;
  buttonClassName?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ label = "ファイルを選択", className, buttonClassName, ...props }, ref) => {
    const [fileName, setFileName] = React.useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // ファイル名は表示しないが、選択されたファイル数を表示
        const fileCount = files.length;
        setFileName(
          fileCount > 1
            ? `${fileCount}個のファイル`
            : "ファイルが選択されました"
        );
      } else {
        setFileName("");
      }

      // 元のonChangeイベントを呼び出し
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className={cn("flex items-center", buttonClassName)}
          >
            <Upload className="h-4 w-4" />
            <span>{label}</span>
          </Button>
          {fileName && (
            <span className="text-sm text-gray-600">{fileName}</span>
          )}
        </div>
        <input
          ref={(node) => {
            // 両方のrefを設定
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            fileInputRef.current = node;
          }}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          {...props}
        />
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };

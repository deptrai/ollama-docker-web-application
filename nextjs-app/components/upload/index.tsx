import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  maxSize = 5, // Kích thước tối đa của file tính bằng MB, mặc định 5MB
}: {
  onChange?: (files: File[]) => void;
  maxSize?: number;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    if (validFiles.length !== newFiles.length) {
      console.warn(`Một số file bị từ chối vì vượt quá giới hạn ${maxSize}MB`);
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    onChange && onChange(validFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onChange && onChange(newFiles);
      return newFiles;
    });
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
    maxSize: maxSize * 1024 * 1024, // Chuyển đổi MB sang bytes
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="card p-10 group/file block relative overflow-hidden hover-scale"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 text-[hsl(var(--foreground))] font-bold text-base">
            Tải lên tệp tin
          </p>
          <p className="relative z-20 text-[hsl(var(--muted-foreground))] text-base mt-2">
            Kéo thả hoặc nhấp vào đây để tải lên (Tối đa {maxSize}MB)
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "card relative overflow-hidden z-40 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-[hsl(var(--foreground))] truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <div className="flex items-center gap-2">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="badge badge-primary flex-shrink-0"
                      >
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-[hsl(var(--muted-foreground))]">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="badge badge-outline"
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      chỉnh sửa lần cuối{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "card relative group-hover/file:shadow-2xl z-40 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[hsl(var(--muted-foreground))] flex flex-col items-center"
                  >
                    Thả vào đây
                    <Upload className="icon-primary h-4 w-4" />
                  </motion.p>
                ) : (
                  <Upload className="icon-primary h-4 w-4" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-[hsl(var(--primary))] inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-[hsl(var(--muted))] flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-[hsl(var(--background))]"
                  : "bg-[hsl(var(--background))] shadow-[0px_0px_1px_3px_hsl(var(--background))_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

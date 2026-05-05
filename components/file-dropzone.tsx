"use client";

import { useCallback, useState } from "react";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title: string;
  description: string;
  isLoading?: boolean;
  status?: "idle" | "success" | "error";
  errorMessage?: string;
}

export function FileDropzone({
  accept,
  multiple = false,
  onFilesSelected,
  title,
  description,
  isLoading = false,
  status = "idle",
  errorMessage,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const validFiles = multiple ? files : [files[0]];
        setSelectedFiles(validFiles);
        onFilesSelected(validFiles);
      }
    },
    [multiple, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        setSelectedFiles(files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          status === "success" && "border-green-500 bg-green-50",
          status === "error" && "border-destructive bg-destructive/5",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Processando...</p>
          </div>
        ) : status === "success" ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium text-green-700">
              Arquivo(s) importado(s) com sucesso!
            </p>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              {errorMessage || "Erro ao processar arquivo(s)"}
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
            <label className="mt-4">
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
                className="sr-only"
              />
              <span className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Selecionar Arquivo{multiple ? "s" : ""}
              </span>
            </label>
          </>
        )}
      </div>

      {selectedFiles.length > 0 && status === "idle" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedFiles.length} arquivo(s) selecionado(s)
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Limpar tudo
            </Button>
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded bg-muted/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import {
  deleteFileAction,
  getDownloadUrlAction,
  uploadFileAction
} from "@/app/files/actions";
import type { FileObject } from "@/db";
import UploadFileDialog from "./upload-file-dialog";
import FileCard from "./card";

type FilesManagerProps = {
  files: FileObject[];
};

export function FilesManager({ files }: FilesManagerProps) {
  const [items, setItems] = useState(files);
  const [isUploading, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setItems(files);
  }, [files]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        startTransition(async () => {
          const formData = new FormData();
          formData.append("file", file);
          try {
            await uploadFileAction(formData);
          } catch (error) {
            console.error(error);
          }
        });
      }
    },
    []
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const onUpload = async (formData: FormData): Promise<void> => {
    try {
      return new Promise<void>((resolve, reject) => {
        startTransition(async () => {
          try {
            await uploadFileAction(formData);
            setIsDialogOpen(false);
            resolve();
          } catch (error) {
            console.error(error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.warn(error);
    }
  };

  const onDownload = async (id: string): Promise<void> => {
    try {
      startTransition(async () => {
        try {
          const _file = await getDownloadUrlAction(id);
          if (_file?.url) {
            window.open(_file.url, "_blank");
          }
        } catch (error) {
          console.warn(error);
        }
      })

    } catch (error) {
      console.warn(error);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    startTransition(async () => {
      try {
        setItems((previous) => previous.filter((item) => item.id !== id));
        await deleteFileAction(id);
      } catch (error) {
        console.warn(error);
      }
    })
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Files</h1>
          <p className="text-sm text-slate-500">
            Upload, download and manage files backed up in the cloud.
          </p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-gold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2"
        >
          Upload file
        </button>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${isDragging ? "border-brand bg-blue-50/40" : "border-slate-300 bg-white"
          }`}
      >
        <p className="text-sm font-medium text-slate-700">
          Drag and drop files here or use the “Upload file” button.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          They will be stored in S3 and will be available for direct download.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDownload={() => onDownload(file.id)}
            onDelete={() => onDelete(file.id)}
          />
        ))}
      </div>

      {isDialogOpen ? (
        <UploadFileDialog
          onClose={() => setIsDialogOpen(false)}
          isPending={isUploading}
          onUpload={onUpload}
        />
      ) : null}
    </div>
  );
}



import type { FileObject } from "@/db";
import { formatDateTime } from "@/lib/utils";
import { useState } from "react";

type FileCardProps = {
  file: FileObject;
  onDownload: () => void;
  onDelete: () => void;
}

const FileCard = ({ file, onDownload, onDelete }: FileCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <article
      key={file.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 truncate max-w-[90%]">
          <h3 className="text-base font-semibold text-slate-900 truncate">{file.name}</h3>
          {file.description ? (
            <p className="text-sm text-slate-500">{file.description}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          .{file.extension}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div>
          <dt className="font-semibold uppercase tracking-wide">Type</dt>
          <dd>{file.mimeType}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide">Created</dt>
          <dd>{formatDateTime(file.createdAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide">Size (MB)</dt>
          <dd>{file.size}</dd>
        </div>
      </dl>
      <div className="mt-auto flex items-center justify-between gap-2">
        <button
          onClick={onDownload}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-black hover:bg-slate-100"
        >
          Download
        </button>
        {isHovering && (
          <button
            onClick={onDelete}
            className="bg-red-50 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-red-600 hover:border-red-100 "
          >
            Delete
          </button>
        )}
      </div>
    </article>
  )
}

export default FileCard;
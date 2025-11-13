import { useState } from "react";

type UploadFileDialogProps = {
  onClose: () => void;
  isPending: boolean;
  onUpload: (formData: FormData) => Promise<void>;
};

const UploadFileDialog = ({ onClose, isPending, onUpload }: UploadFileDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pending = isPending || isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    setIsSubmitting(true);
    try {
      await onUpload(formData);
      setFile(null);
      setDescription("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Upload file</h2>
            <p className="text-sm text-slate-500">
              Select a file or drag it into the box below.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-transparent px-2 py-1 text-sm text-slate-500 hover:border-slate-200 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              const dropped = event.dataTransfer.files?.[0];
              if (dropped) {
                setFile(dropped);
              }
            }}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
          >
            <p className="text-sm font-medium text-slate-700">Drag and drop your file here</p>
            <p className="text-xs text-slate-500">or click to select</p>
            <label className="mt-2 cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-semibold text-gold hover:bg-gray-800">
              Select file
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                  }
                }}
              />
            </label>
            {file ? (
              <p className="text-xs text-slate-500">
                Selected file: <span className="font-semibold">{file.name}</span>
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="Internal notes about the file."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || pending}
              className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-gold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 cursor-pointer"
            >
              {pending ? "Loading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadFileDialog;
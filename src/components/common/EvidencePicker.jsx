import { useRef } from "react";
import { ImagePlus, X, Paperclip } from "lucide-react";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches backend limit

export default function EvidencePicker({ files, onChange, label = "Evidence (optional)" }) {
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    const picked = Array.from(e.target.files || []);
    const room = MAX_FILES - files.length;
    const accepted = picked.filter((f) => f.size <= MAX_SIZE).slice(0, room);
    onChange([...files, ...accepted]);
    e.target.value = "";
  };

  const removeAt = (idx) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div
            key={i}
            className="relative flex size-16 items-center justify-center overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)]"
          >
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="size-full object-cover"
              />
            ) : (
              <Paperclip className="size-5 text-[var(--color-ink-soft)]" />
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              aria-label={`Remove ${file.name}`}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {files.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-16 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber-ink)] dark:hover:text-[var(--color-amber)]"
          >
            <ImagePlus className="size-4" />
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
        Up to {MAX_FILES} photos or short clips, 10MB each.
      </p>
    </div>
  );
}

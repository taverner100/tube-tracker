/**
 * StationPhotoZone
 * Drag-and-drop (or click-to-select) photo upload zone shown next to a visited station.
 * Shows a thumbnail if a photo is already attached, with a remove button.
 */
import { useRef, useState, useCallback } from "react";
import { ImagePlus, X, Loader2, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  stationId: string;
  photoUrl: string | null;
  photoFilename: string | null;
  lineColour: string;
  isUploading: boolean;
  onUpload: (stationId: string, file: File) => Promise<void>;
  onRemove: (stationId: string) => void;
  onLightbox: (url: string, name: string) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"];

export default function StationPhotoZone({
  stationId,
  photoUrl,
  photoFilename,
  lineColour,
  isUploading,
  onUpload,
  onRemove,
  onLightbox,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED.includes(file.type)) return;
      setLocalUploading(true);
      try {
        await onUpload(stationId, file);
      } finally {
        setLocalUploading(false);
      }
    },
    [stationId, onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const busy = isUploading || localUploading;

  // ── Has photo ──────────────────────────────────────────────────────────────
  if (photoUrl) {
    return (
      <div className="relative flex-shrink-0 group">
        <button
          type="button"
          onClick={() => onLightbox(photoUrl, photoFilename ?? "Station photo")}
          className="block w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-150 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ borderColor: lineColour }}
          title="View photo"
        >
          <img
            src={photoUrl}
            alt={photoFilename ?? "Station photo"}
            className="w-full h-full object-cover"
          />
          {/* Zoom hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
            <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(stationId); }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-stone-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none"
          title="Remove photo"
        >
          <X size={9} />
        </button>
      </div>
    );
  }

  // ── No photo — upload zone ─────────────────────────────────────────────────
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={onInputChange}
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        disabled={busy}
        title="Add photo"
        className={cn(
          "flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-0.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          isDragging
            ? "scale-105 bg-stone-100"
            : "bg-stone-50 hover:bg-stone-100",
          busy && "opacity-60 cursor-not-allowed"
        )}
        style={{
          borderColor: isDragging ? lineColour : "#d6d3d1",
          // Subtle line-colour tint on drag
          backgroundColor: isDragging ? `${lineColour}18` : undefined,
        }}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin text-stone-400" />
        ) : (
          <>
            <ImagePlus size={16} className="text-stone-400" />
            <span className="text-[9px] text-stone-400 leading-none font-medium tracking-wide uppercase">
              Photo
            </span>
          </>
        )}
      </button>
    </>
  );
}

/**
 * PhotoLightbox — full-screen overlay for viewing a station photo.
 */
import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  url: string;
  name: string;
  onClose: () => void;
}

export default function PhotoLightbox({ url, name, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt={name}
          className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
        />
        <p className="text-center text-white/70 text-sm mt-2 font-medium tracking-wide"
           style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {name}
        </p>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

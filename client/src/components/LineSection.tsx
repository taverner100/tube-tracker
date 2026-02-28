/**
 * Design: Cartographic Minimalism
 * Accordion section for a single tube line.
 * - Thick coloured left-border rule (4px) in the line's TfL colour
 * - Slim station rows with checkbox, name, zone badge, and photo zone
 * - Per-line progress donut + visited count
 * - Mark all / Unmark all controls
 *
 * NOTE: The header is a <div role="button"> (not a <button>) because it
 * contains nested <button> elements (Mark All / None), and HTML does not
 * allow <button> inside <button>.
 */

import { ChevronDown, ChevronRight, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Line } from "@/lib/stationsData";
import type { VisitRecord } from "@/hooks/useVisits";
import ProgressRing from "./ProgressRing";
import StationPhotoZone from "./StationPhotoZone";

interface LineSectionProps {
  line: Line;
  visitMap: Map<string, VisitRecord>;
  visitedCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStation: (id: string) => void;
  onMarkAll: () => void;
  onUnmarkAll: () => void;
  onUploadPhoto: (stationId: string, file: File) => Promise<void>;
  onRemovePhoto: (stationId: string) => void;
  onLightbox: (url: string, name: string) => void;
  isUploading: boolean;
}

export default function LineSection({
  line,
  visitMap,
  visitedCount,
  isExpanded,
  onToggleExpand,
  onToggleStation,
  onMarkAll,
  onUnmarkAll,
  onUploadPhoto,
  onRemovePhoto,
  onLightbox,
  isUploading,
}: LineSectionProps) {
  const total = line.stations.length;
  const pct = total > 0 ? (visitedCount / total) * 100 : 0;
  const allVisited = visitedCount === total;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden border border-stone-100 shadow-sm"
      style={{ borderLeft: `4px solid ${line.colour}` }}
    >
      {/* Header row — div instead of button to allow nested buttons */}
      <div
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50 transition-colors cursor-pointer select-none"
        onClick={onToggleExpand}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand();
          }
        }}
      >
        {/* Expand icon */}
        <span className="text-stone-400 flex-shrink-0">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        {/* Line colour pill + name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
            style={{
              backgroundColor: line.colour,
              color: line.textColour,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            {line.name}
          </span>
          <span
            className="text-stone-400 text-xs flex-shrink-0"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {visitedCount}/{total}
          </span>
          {allVisited && (
            <span className="text-xs font-medium text-emerald-600 flex-shrink-0">
              ✓ Complete
            </span>
          )}
        </div>

        {/* Right side: Mark/Unmark buttons + progress ring */}
        <div
          className="flex-shrink-0 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {isExpanded && (
            <div className="flex items-center gap-1">
              <button
                onClick={onMarkAll}
                title="Mark all as visited"
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                <CheckCheck size={12} />
                <span className="hidden sm:inline">All</span>
              </button>
              <button
                onClick={onUnmarkAll}
                title="Unmark all"
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                <X size={12} />
                <span className="hidden sm:inline">None</span>
              </button>
            </div>
          )}
          <ProgressRing
            percentage={pct}
            size={32}
            strokeWidth={3}
            colour={line.colour}
            showLabel={false}
          />
        </div>
      </div>

      {/* Station list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-stone-100">
              {[...line.stations]
                .sort((a, b) => {
                  const aVisited = visitMap.has(a.id) ? 1 : 0;
                  const bVisited = visitMap.has(b.id) ? 1 : 0;
                  // Unvisited (0) before visited (1); preserve original order within each group
                  return aVisited - bVisited;
                })
                .map((station, idx) => {
                const visit = visitMap.get(station.id);
                const isVisited = !!visit;
                return (
                  <div
                    key={station.id}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${
                      idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                    } hover:bg-stone-50`}
                  >
                    {/* Checkbox — wrapped in label for click area */}
                    <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isVisited}
                          onChange={() => onToggleStation(station.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                            isVisited
                              ? "border-transparent"
                              : "border-stone-300 group-hover:border-stone-400"
                          }`}
                          style={isVisited ? { backgroundColor: line.colour } : {}}
                        >
                          {isVisited && (
                            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke={line.textColour}
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Station name */}
                      <span
                        className={`flex-1 text-sm transition-all duration-150 ${
                          isVisited
                            ? "text-stone-400 line-through decoration-stone-300"
                            : "text-stone-800"
                        }`}
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                      >
                        {station.name}
                      </span>

                      {/* Zone badge */}
                      {station.zone && (
                        <span
                          className="text-xs text-stone-400 flex-shrink-0 tabular-nums"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          title={`Zone ${station.zone}`}
                        >
                          Z{station.zone}
                        </span>
                      )}
                    </label>

                    {/* Photo zone — only shown when visited */}
                    {isVisited && (
                      <StationPhotoZone
                        stationId={station.id}
                        photoUrl={visit.photoUrl ?? null}
                        photoFilename={visit.photoFilename ?? null}
                        lineColour={line.colour}
                        isUploading={isUploading}
                        onUpload={onUploadPhoto}
                        onRemove={onRemovePhoto}
                        onLightbox={onLightbox}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

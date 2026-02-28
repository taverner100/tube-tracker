/**
 * Design Philosophy: Cartographic Minimalism
 * - Warm off-white background (#FAFAF8) — like a printed A-Z map
 * - Deep charcoal text (#1C1C1E) — legible at all sizes
 * - TfL line colours are the SOLE source of visual accent
 * - IBM Plex Sans for UI, Playfair Display for editorial title
 * - Thin coloured left-border rules, accordion line sections
 * - Swiss International Typographic Style meets London wayfinding
 */

import { useState, useMemo } from "react";
import { LINES, TOTAL_STATIONS } from "@/lib/stationsData";
import { useVisitedStations } from "@/hooks/useVisitedStations";
import LineSection from "@/components/LineSection";
import ProgressRing from "@/components/ProgressRing";
import FilterBar from "@/components/FilterBar";
import { Train, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type FilterMode = "all" | "visited" | "unvisited";

export default function Home() {
  const { visited, toggleStation, markAllOnLine, unmarkAllOnLine, resetAll } =
    useVisitedStations();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [expandedLines, setExpandedLines] = useState<Set<string>>(
    new Set(LINES.map((l) => l.id))
  );

  const totalVisited = visited.size;
  const progressPct = TOTAL_STATIONS > 0 ? (totalVisited / TOTAL_STATIONS) * 100 : 0;

  const toggleLineExpanded = (lineId: string) => {
    setExpandedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  const expandAll = () => setExpandedLines(new Set(LINES.map((l) => l.id)));
  const collapseAll = () => setExpandedLines(new Set());

  // Filter lines/stations based on search + filter mode
  const filteredLines = useMemo(() => {
    return LINES.map((line) => {
      const stations = line.stations.filter((s) => {
        const matchesSearch =
          search === "" ||
          s.name.toLowerCase().includes(search.toLowerCase());
        const isVisited = visited.has(s.id);
        const matchesFilter =
          filter === "all" ||
          (filter === "visited" && isVisited) ||
          (filter === "unvisited" && !isVisited);
        return matchesSearch && matchesFilter;
      });
      return { ...line, stations };
    }).filter((line) => line.stations.length > 0);
  }, [search, filter, visited]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#FAFAF8]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            {/* Title block */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Roundel icon */}
              <div className="flex-shrink-0 w-10 h-10 relative">
                <svg viewBox="0 0 40 40" className="w-10 h-10">
                  {/* Outer ring */}
                  <circle cx="20" cy="20" r="18" fill="#E32017" />
                  <circle cx="20" cy="20" r="14" fill="#003688" />
                  <circle cx="20" cy="20" r="10" fill="#E32017" />
                  {/* Horizontal bar */}
                  <rect x="2" y="16" width="36" height="8" fill="#003688" />
                  {/* Inner white circle */}
                  <circle cx="20" cy="20" r="7" fill="white" />
                </svg>
              </div>
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold leading-tight text-stone-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Tube Tracker
                </h1>
                <p className="text-xs text-stone-500 font-medium tracking-widest uppercase mt-0.5"
                   style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  London Underground
                </p>
              </div>
            </div>

            {/* Progress summary */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <span
                  className="text-2xl font-bold text-stone-900"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {totalVisited}
                  <span className="text-stone-400 font-normal text-lg">
                    /{TOTAL_STATIONS}
                  </span>
                </span>
                <span className="text-xs text-stone-500 uppercase tracking-widest">
                  Stations visited
                </span>
              </div>
              <ProgressRing
                percentage={progressPct}
                size={56}
                strokeWidth={5}
                colour="#E32017"
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: "#E32017",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-stone-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {progressPct.toFixed(1)}% complete
            </span>
            <span className="text-xs text-stone-400 sm:hidden" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {totalVisited}/{TOTAL_STATIONS}
            </span>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />
      </div>

      {/* Line sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {filteredLines.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Train className="mx-auto mb-3 opacity-30" size={40} />
            <p className="text-lg font-medium">No stations match your filter</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLines.map((line) => {
              const lineVisited = line.stations.filter((s) =>
                visited.has(s.id)
              ).length;
              const isExpanded = expandedLines.has(line.id);
              return (
                <LineSection
                  key={line.id}
                  line={line}
                  visited={visited}
                  visitedCount={lineVisited}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleLineExpanded(line.id)}
                  onToggleStation={toggleStation}
                  onMarkAll={() =>
                    markAllOnLine(line.stations.map((s) => s.id))
                  }
                  onUnmarkAll={() =>
                    unmarkAllOnLine(line.stations.map((s) => s.id))
                  }
                />
              );
            })}
          </div>
        )}

        {/* Reset button */}
        {totalVisited > 0 && (
          <div className="mt-8 flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors px-4 py-2 rounded-lg hover:bg-stone-100">
                  <RotateCcw size={14} />
                  Reset all progress
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will uncheck all {totalVisited} visited station
                    {totalVisited !== 1 ? "s" : ""}. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetAll}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reset progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </main>
    </div>
  );
}

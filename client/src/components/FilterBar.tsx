/**
 * Design: Cartographic Minimalism
 * Search input + filter toggle pills + expand/collapse controls.
 */

import { Search, X, ChevronsUpDown } from "lucide-react";
import type { FilterMode } from "@/pages/Home";

interface FilterBarProps {
  filter: FilterMode;
  onFilterChange: (f: FilterMode) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const FILTERS: { value: FilterMode; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visited", label: "Visited" },
  { value: "unvisited", label: "Unvisited" },
];

export default function FilterBar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      {/* Left: search + filter pills */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stations…"
            className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filter === f.value
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: expand/collapse */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onExpandAll}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 px-2 py-1.5 rounded hover:bg-stone-100 transition-colors"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          <ChevronsUpDown size={13} />
          Expand all
        </button>
        <span className="text-stone-300 text-xs">·</span>
        <button
          onClick={onCollapseAll}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 px-2 py-1.5 rounded hover:bg-stone-100 transition-colors"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          Collapse all
        </button>
      </div>
    </div>
  );
}

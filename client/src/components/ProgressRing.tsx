/**
 * Design: Cartographic Minimalism
 * Small circular progress indicator — used in line headers and the main header.
 */

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colour?: string;
  showLabel?: boolean;
}

export default function ProgressRing({
  percentage,
  size = 40,
  strokeWidth = 4,
  colour = "#E32017",
  showLabel = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {showLabel && (
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color: colour, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {Math.round(percentage)}
        </div>
      )}
    </div>
  );
}

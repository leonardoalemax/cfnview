interface WinRateBarProps {
	winPct: number;          // 0–100
	height?: "sm" | "md";   // sm = h-1.5, md = h-2.5 (default)
	fillColor?: string;      // override bg color (e.g. custom HSL for heatmap)
}

export default function WinRateBar({ winPct, height = "md", fillColor }: WinRateBarProps) {
	const trackH = height === "sm" ? "h-1.5" : "h-2.5";
	return (
		<div className={`w-full rounded-full bg-base-300 overflow-hidden ${trackH}`}>
			<div
				className={`h-full rounded-full transition-all duration-500 ${fillColor ? "" : "bg-success"}`}
				style={{ width: `${Math.min(100, Math.max(0, winPct))}%`, ...(fillColor ? { background: fillColor } : {}) }}
			/>
		</div>
	);
}

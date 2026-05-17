"use client";

import type { WeeklyHeatmap as WeeklyHeatmapData } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type Mode = "winrate" | "battles";

function winRateColor(wins: number, total: number): string {
	if (total === 0) return "transparent";
	const pct = wins / total;
	const h = pct <= 0.5 ? pct * 2 * 30 : 30 + (pct - 0.5) * 2 * 90;
	return `hsl(${Math.round(h)}, 75%, 40%)`;
}

function battlesColor(total: number, maxBattles: number): string {
	if (total === 0) return "transparent";
	if (maxBattles === 0) return "hsl(140, 40%, 15%)";
	const intensity = Math.min(total / maxBattles, 1);
	const l = 15 + intensity * 30;
	const s = 40 + intensity * 30;
	return `hsl(140, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export default function WeeklyHeatmap({ data, mode }: { data: WeeklyHeatmapData | null; mode: Mode }) {
	if (!data) return null;

	const days = data.days;

	let maxTotal = 0;
	let bestDay = -1;
	let bestHour = -1;
	let bestScore = 0;
	for (let d = 0; d < days.length; d++) {
		for (const h of days[d]) {
			if (h.total > maxTotal) maxTotal = h.total;
			if (h.total > 0) {
				const score = (h.wins / h.total) * Math.log2(1 + h.total);
				if (score > bestScore) {
					bestScore = score;
					bestDay = d;
					bestHour = h.hour;
				}
			}
		}
	}
	if (maxTotal === 0) maxTotal = 1;

	function cellColor(wins: number, total: number): string {
		if (total === 0) return "transparent";
		if (mode === "winrate") return winRateColor(wins, total);
		return battlesColor(total, maxTotal);
	}

	return (
		<StatCard>
			<SectionTitle
				subtitle={mode === "winrate" ? "Win rate por dia e hora" : "Batalhas por dia e hora"}
			>
				Heatmap semanal
			</SectionTitle>

			<div className="overflow-x-auto pb-1">
				<div className="inline-flex gap-0.5" style={{ minWidth: 320 }}>
					<div className="flex flex-col gap-0.5 pr-1">
						<div className="h-5" />
						{Array.from({ length: 24 }, (_, h) => (
							<div key={h} className="h-5 flex items-center justify-end">
								<span className="text-[9px] text-base-content/40 leading-none">{h}h</span>
							</div>
						))}
					</div>

					{days.map((hourStats, dayIdx) => (
						<div key={dayIdx} className="flex flex-col gap-0.5 flex-1" style={{ minWidth: 36 }}>
							<div className="h-5 flex items-center justify-center">
								<span className="text-[10px] text-base-content/50 font-medium">{DAY_LABELS[dayIdx]}</span>
							</div>

							{hourStats.map((stat) => {
								const hasData = stat.total > 0;
								const wr = hasData ? Math.round((stat.wins / stat.total) * 100) : 0;
								const bg = cellColor(stat.wins, stat.total);
								const isBest = dayIdx === bestDay && stat.hour === bestHour;
								const title = hasData
									? `${DAY_LABELS[dayIdx]} ${stat.hour}h: ${stat.total} batalhas — ${stat.wins}W / ${stat.total - stat.wins}L (${wr}%)${isBest ? " — Melhor momento para jogar!" : ""}`
									: `${DAY_LABELS[dayIdx]} ${stat.hour}h: sem dados`;

								return (
									<div
										key={stat.hour}
										title={title}
										className="h-5 rounded-sm flex items-center justify-center relative"
										style={{
											background: hasData ? bg : undefined,
											outline: isBest ? "2px solid gold" : undefined,
											outlineOffset: isBest ? "-1px" : undefined,
										}}
									>
										{!hasData && <div className="absolute inset-0 rounded-sm bg-base-300/50" />}
										{isBest && (
											<span className="absolute -top-1 -right-1 text-[8px] leading-none z-10" title="Melhor momento para jogar!">&#11088;</span>
										)}
										{hasData && (
											<span className="text-[9px] font-bold leading-none text-white/90">
												{mode === "winrate" ? `${wr}%` : stat.total}
											</span>
										)}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>

			<div className="flex items-center gap-1 mt-3 justify-end">
				{mode === "winrate" ? (
					<>
						<span className="text-[10px] text-base-content/50">0%</span>
						{[0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].map((v) => (
							<div key={v} className="w-3 h-3 rounded-sm" style={{ background: winRateColor(v, 1) }} />
						))}
						<span className="text-[10px] text-base-content/50">100%</span>
					</>
				) : (
					<>
						<span className="text-[10px] text-base-content/50">1</span>
						{[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((v) => (
							<div key={v} className="w-3 h-3 rounded-sm" style={{ background: battlesColor(v * maxTotal, maxTotal) }} />
						))}
						<span className="text-[10px] text-base-content/50">{maxTotal}</span>
					</>
				)}
			</div>
		</StatCard>
	);
}

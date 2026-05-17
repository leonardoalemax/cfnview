"use client";

import { useState } from "react";
import type { HourlyStats } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

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

export default function HourlyHeatmap({ data }: { data: HourlyStats | null }) {
	const [mode, setMode] = useState<Mode>("winrate");

	if (!data) return null;

	const hours = data.hours;
	const maxTotal = Math.max(...hours.map((h) => h.total), 1);
	const am = hours.slice(0, 12);
	const pm = hours.slice(12, 24);

	function cellColor(stat: { wins: number; total: number }): string {
		if (stat.total === 0) return "transparent";
		if (mode === "winrate") return winRateColor(stat.wins, stat.total);
		return battlesColor(stat.total, maxTotal);
	}

	function renderRow(row: typeof hours, label: string) {
		return (
			<div className="flex flex-col gap-1">
				<span className="text-[10px] text-base-content/40 font-medium tracking-wider uppercase">
					{label}
				</span>
				<div className="grid grid-cols-12 gap-1">
					{row.map((stat) => {
						const hasData = stat.total > 0;
						const wr = hasData ? Math.round((stat.wins / stat.total) * 100) : 0;
						const bg = cellColor(stat);
						const title = hasData
							? `${stat.hour}h: ${stat.total} batalhas — ${stat.wins}W / ${stat.total - stat.wins}L (${wr}%)`
							: `${stat.hour}h: sem dados`;

						return (
							<div
								key={stat.hour}
								title={title}
								className="rounded aspect-square flex flex-col items-center justify-center relative"
								style={{
									background: hasData ? bg : undefined,
								}}
							>
								{!hasData && (
									<div className="absolute inset-0 rounded bg-base-300/50" />
								)}
								<span
									className="text-[10px] leading-none"
									style={{ color: hasData ? "rgba(255,255,255,0.6)" : "oklch(var(--bc) / 0.25)" }}
								>
									{stat.hour}h
								</span>
								{hasData && (
									<span className="text-xs font-bold leading-none mt-0.5 text-white">
										{mode === "winrate" ? `${wr}%` : stat.total}
									</span>
								)}
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<StatCard>
			<SectionTitle
				subtitle={mode === "winrate" ? "Win rate por hora do dia" : "Batalhas por hora do dia"}
			>
				Heatmap por hora
			</SectionTitle>

			<div className="flex gap-1 mb-3">
				<button
					className={`btn btn-xs ${mode === "winrate" ? "btn-primary" : "btn-ghost"}`}
					onClick={() => setMode("winrate")}
				>
					Win Rate
				</button>
				<button
					className={`btn btn-xs ${mode === "battles" ? "btn-primary" : "btn-ghost"}`}
					onClick={() => setMode("battles")}
				>
					Batalhas
				</button>
			</div>

			<div className="flex flex-col gap-3">
				{renderRow(am, "Manha")}
				{renderRow(pm, "Tarde / Noite")}
			</div>

			{/* Legenda */}
			<div className="flex items-center gap-1 mt-3 justify-end">
				{mode === "winrate" ? (
					<>
						<span className="text-[10px] text-base-content/50">0%</span>
						{[0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].map((v) => (
							<div
								key={v}
								className="w-3 h-3 rounded-sm"
								style={{ background: winRateColor(v, 1) }}
							/>
						))}
						<span className="text-[10px] text-base-content/50">100%</span>
					</>
				) : (
					<>
						<span className="text-[10px] text-base-content/50">1</span>
						{[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((v) => (
							<div
								key={v}
								className="w-3 h-3 rounded-sm"
								style={{ background: battlesColor(v * maxTotal, maxTotal) }}
							/>
						))}
						<span className="text-[10px] text-base-content/50">{maxTotal}</span>
					</>
				)}
			</div>
		</StatCard>
	);
}

"use client";

import { useState } from "react";
import type { HourlyStats } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

type Mode = "winrate" | "battles";

function winRateColor(wins: number, total: number): string {
	if (total === 0) return "oklch(var(--b3))";
	const pct = wins / total;
	const h = pct <= 0.5 ? pct * 2 * 30 : 30 + (pct - 0.5) * 2 * 90;
	return `hsl(${Math.round(h)}, 75%, 40%)`;
}

function battlesColor(total: number, maxBattles: number): string {
	if (maxBattles === 0) return "hsl(140, 40%, 15%)";
	const intensity = Math.min(total / maxBattles, 1);
	const l = 15 + intensity * 30;
	const s = 40 + intensity * 30;
	return `hsl(140, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function formatHour(h: number): string {
	return `${String(h).padStart(2, "0")}h`;
}

const CELL_W = 36;
const CELL_H = 40;
const GAP = 3;

export default function HourlyHeatmap({ data }: { data: HourlyStats | null }) {
	const [mode, setMode] = useState<Mode>("winrate");

	if (!data) return null;

	const hours = data.hours;
	const maxTotal = Math.max(...hours.map((h) => h.total), 1);

	function cellColor(stat: { wins: number; total: number }): string {
		if (stat.total === 0) return "oklch(var(--b3))";
		if (mode === "winrate") return winRateColor(stat.wins, stat.total);
		return battlesColor(stat.total, maxTotal);
	}

	function cellLabel(stat: { wins: number; total: number }): string | null {
		if (stat.total === 0) return null;
		if (mode === "winrate") return `${Math.round((stat.wins / stat.total) * 100)}%`;
		return `${stat.total}`;
	}

	return (
		<StatCard>
			<SectionTitle subtitle={mode === "winrate" ? "Win rate por hora do dia" : "Batalhas por hora do dia"}>
				Heatmap por hora
			</SectionTitle>

			{/* Toggle */}
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

			<div className="overflow-x-auto pb-1">
				<div
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(24, ${CELL_W}px)`,
						gap: GAP,
						minWidth: 24 * (CELL_W + GAP),
					}}
				>
					{hours.map((stat) => {
						const wr = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : null;
						const opacity = stat.total > 0 ? 0.3 + 0.7 * (stat.total / maxTotal) : 1;
						const bg = cellColor(stat);
						const label = cellLabel(stat);

						return (
							<div
								key={stat.hour}
								title={
									stat.total > 0
										? `${formatHour(stat.hour)}: ${stat.total} batalhas — ${stat.wins}W / ${stat.total - stat.wins}L (${wr}% WR)`
										: `${formatHour(stat.hour)}: sem dados`
								}
								style={{
									width: CELL_W,
									height: CELL_H,
									background: bg,
									opacity: mode === "winrate" ? opacity : 1,
									borderRadius: 4,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									gap: 1,
									cursor: stat.total > 0 ? "default" : undefined,
								}}
							>
								<span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", lineHeight: 1 }}>
									{formatHour(stat.hour)}
								</span>
								{label !== null ? (
									<span style={{ fontSize: 11, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
										{label}
									</span>
								) : (
									<span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1 }}>—</span>
								)}
								{stat.total > 0 && mode === "winrate" && (
									<span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>
										{stat.total}j
									</span>
								)}
							</div>
						);
					})}
				</div>

				{/* Legenda */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						marginTop: 8,
						justifyContent: "flex-end",
					}}
				>
					{mode === "winrate" ? (
						<>
							<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>0%</span>
							{[0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].map((v) => (
								<div
									key={v}
									style={{ width: 12, height: 12, borderRadius: 2, background: winRateColor(v, 1) }}
								/>
							))}
							<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>100%</span>
						</>
					) : (
						<>
							<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>1</span>
							{[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((v) => (
								<div
									key={v}
									style={{ width: 12, height: 12, borderRadius: 2, background: battlesColor(v * maxTotal, maxTotal) }}
								/>
							))}
							<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>{maxTotal}</span>
						</>
					)}
				</div>
			</div>
		</StatCard>
	);
}

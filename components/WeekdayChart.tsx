"use client";

import type { CalendarStat } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type Mode = "winrate" | "battles";

function winRateColor(wins: number, total: number): string {
	const pct = wins / total;
	const h = pct <= 0.5 ? pct * 2 * 30 : 30 + (pct - 0.5) * 2 * 90;
	return `hsl(${Math.round(h)}, 75%, 45%)`;
}

function battlesColor(total: number, maxBattles: number): string {
	if (maxBattles === 0) return "hsl(140, 40%, 15%)";
	const intensity = Math.min(total / maxBattles, 1);
	const l = 15 + intensity * 30;
	const s = 40 + intensity * 30;
	return `hsl(140, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export default function WeekdayChart({ data, mode }: { data: CalendarStat | null; mode: Mode }) {
	if (!data) return null;

	const byWeekday = data.by_weekday;
	const maxTotal = Math.max(...byWeekday.map((s) => s.total), 1);

	return (
		<StatCard bodyClassName="gap-3">
			<SectionTitle>
				{mode === "winrate" ? "Win rate por dia da semana" : "Batalhas por dia da semana"}
			</SectionTitle>
			<div className="flex flex-col gap-2">
				{byWeekday.map((stat, i) => {
					const wr = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : null;
					const barPct = mode === "winrate"
						? (wr ?? 0)
						: Math.round((stat.total / maxTotal) * 100);
					const barColor = mode === "winrate"
						? (stat.total > 0 ? winRateColor(stat.wins, stat.total) : undefined)
						: (stat.total > 0 ? battlesColor(stat.total, maxTotal) : undefined);

					return (
						<div key={i} className="flex items-center gap-2">
							<span className="w-7 text-[11px] text-right text-base-content/50 shrink-0">
								{DAY_LABELS[i]}
							</span>
							<div className="flex-1 h-[18px] rounded bg-base-300 overflow-hidden">
								{stat.total > 0 && (
									<div
										className="h-full rounded transition-all duration-300"
										style={{ width: `${barPct}%`, background: barColor }}
									/>
								)}
							</div>
							<div className="w-[110px] text-[11px] shrink-0 flex gap-1.5 justify-end">
								{stat.total > 0 ? (
									<>
										<span className="text-base-content/40">{stat.total}j</span>
										<span
											className="font-semibold"
											style={{ color: wr !== null && wr >= 50 ? "hsl(120,55%,45%)" : "hsl(0,65%,50%)" }}
										>
											{wr}%
										</span>
									</>
								) : (
									<span className="text-base-content/30">&mdash;</span>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</StatCard>
	);
}

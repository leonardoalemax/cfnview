"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { WinLossStat } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import WinRateBar from "./ui/WinRateBar";

export default function WinLossChart({ data }: { data: WinLossStat | null }) {
	if (!data || data.total === 0) return null;

	const { wins, losses, total, win_pct } = data;
	const lossPct = 100 - win_pct;

	const chartData = [
		{ name: "Vitórias", value: wins, pct: win_pct },
		{ name: "Derrotas", value: losses, pct: lossPct },
	];

	const COLORS = ["#36d399", "#f87272"];

	return (
		<StatCard bodyClassName="gap-3">
			<SectionTitle>Win Rate</SectionTitle>

			<div className="flex items-center gap-6">
				<div className="w-36 h-36 shrink-0">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								innerRadius="60%"
								outerRadius="80%"
								startAngle={90}
								endAngle={-270}
								dataKey="value"
								strokeWidth={0}
							>
								{chartData.map((_, i) => (
									<Cell key={i} fill={COLORS[i]} />
								))}
							</Pie>
							<Tooltip
								formatter={(value, name) =>
									[`${value} (${chartData.find((d) => d.name === name)?.pct}%)`, name]
								}
								contentStyle={{
									background: "#1d232a",
									border: "1px solid #2a323c",
									borderRadius: "0.5rem",
									fontSize: "0.75rem",
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>

				<div className="flex flex-col gap-3 flex-1">
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm">
							<span className="w-3 h-3 rounded-full bg-success inline-block" />
							Vitórias
						</span>
						<span className="font-bold text-success">
							{wins} <span className="text-base-content/50 font-normal">({win_pct}%)</span>
						</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm">
							<span className="w-3 h-3 rounded-full bg-error inline-block" />
							Derrotas
						</span>
						<span className="font-bold text-error">
							{losses} <span className="text-base-content/50 font-normal">({lossPct}%)</span>
						</span>
					</div>

					<div className="divider my-0" />

					<div className="flex items-center justify-between text-sm text-base-content/60">
						<span>Total</span>
						<span className="font-semibold text-base-content">{total} batalhas</span>
					</div>
				</div>
			</div>

			<WinRateBar winPct={win_pct} />
		</StatCard>
	);
}

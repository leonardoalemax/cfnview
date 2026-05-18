"use client";

import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import clsx from "clsx";
import type { LPHistory } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

const RANKS = [
	{ lp: 1000,  label: "Iron",     color: "#8b7355" },
	{ lp: 3000,  label: "Bronze",   color: "#cd7f32" },
	{ lp: 5000,  label: "Silver",   color: "#9ca3af" },
	{ lp: 9000,  label: "Gold",     color: "#eab308" },
	{ lp: 13000, label: "Platinum", color: "#67e8f9" },
	{ lp: 19000, label: "Diamond",  color: "#818cf8" },
	{ lp: 25000, label: "Master",   color: "#f472b6" },
];

function formatDate(date: string): string {
	const [, m, d] = date.split("-");
	return `${d}/${m}`;
}

interface Props {
	data: LPHistory | null;
}

export default function LPChart({ data }: Props) {
	const entries = data?.entries ?? [];

	if (entries.length === 0) {
		return (
			<StatCard>
				<SectionTitle>Evolução de LP</SectionTitle>
				<div className="text-sm text-base-content/40 text-center py-8">
					Sem dados para este personagem
				</div>
			</StatCard>
		);
	}

	return (
		<StatCard>
			<SectionTitle
				aside={
					entries.length >= 2 ? (() => {
						const delta = entries[entries.length - 1].lp - entries[0].lp;
						return (
							<span className={clsx("text-xs font-semibold", delta >= 0 ? "text-success" : "text-error")}>
								{delta >= 0 ? "+" : ""}{delta} LP
							</span>
						);
					})() : null
				}
			>
				Evolução de LP
			</SectionTitle>

			{(() => {
				const minLP = Math.min(...entries.map((e) => e.lp));
				const maxLP = Math.max(...entries.map((e) => e.lp));
				const visibleRanks = RANKS.filter((r) => r.lp >= minLP - 1500 && r.lp <= maxLP + 1500);
				const yMin = Math.min(minLP, ...visibleRanks.map((r) => r.lp)) - 200;
				const yMax = Math.max(maxLP, ...visibleRanks.map((r) => r.lp)) + 200;

				return (
					<ResponsiveContainer width="100%" height={200}>
						<LineChart data={entries} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
							<XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} minTickGap={32} />
							<YAxis tick={{ fontSize: 11 }} width={48} domain={[yMin, yMax]} />
							<Tooltip
								contentStyle={{
									background: "#1e1b3a",
									border: "1px solid rgba(255,255,255,0.12)",
									borderRadius: "0.5rem",
									fontSize: "0.75rem",
								}}
								labelFormatter={(label) => label}
								formatter={(value) => [`${value} LP`, "LP"]}
							/>
							{visibleRanks.map((r) => (
								<ReferenceLine
									key={r.lp}
									y={r.lp}
									stroke={r.color}
									strokeDasharray="4 3"
									strokeOpacity={0.6}
									label={{ value: r.label, position: "insideTopRight", fill: r.color, fontSize: 10, opacity: 0.8 }}
								/>
							))}
							<Line type="monotone" dataKey="lp" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
						</LineChart>
					</ResponsiveContainer>
				);
			})()}
		</StatCard>
	);
}

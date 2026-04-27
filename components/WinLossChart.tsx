import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SF6Replay } from "../lib/types";
import { getWinner } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import WinRateBar from "./ui/WinRateBar";

interface Props {
	replays: SF6Replay[];
	userId: string;
}

function findUserSide(replay: SF6Replay, userId: string): 1 | 2 | null {
	if (replay.player1_info.player.short_id.toString() === userId) return 1;
	if (replay.player2_info.player.short_id.toString() === userId) return 2;
	if (replay.player1_info.player.fighter_id === userId) return 1;
	if (replay.player2_info.player.fighter_id === userId) return 2;
	return null;
}

export default function WinLossChart({ replays, userId }: Props) {
	let wins = 0;
	let losses = 0;

	for (const replay of replays) {
		const side = findUserSide(replay, userId);
		if (side === null) continue;
		getWinner(replay) === side ? wins++ : losses++;
	}

	const total = wins + losses;
	if (total === 0) return null;

	const winPct = Math.round((wins / total) * 100);
	const lossPct = 100 - winPct;

	const data = [
		{ name: "Vitórias", value: wins, pct: winPct },
		{ name: "Derrotas", value: losses, pct: lossPct },
	];

	const COLORS = ["oklch(var(--su))", "oklch(var(--er))"];

	return (
		<StatCard className="mb-6" bodyClassName="gap-3">
			<SectionTitle>Win Rate — página atual</SectionTitle>

			<div className="flex items-center gap-6">
				{/* Donut */}
				<div className="w-36 h-36 shrink-0">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								innerRadius="60%"
								outerRadius="80%"
								startAngle={90}
								endAngle={-270}
								dataKey="value"
								strokeWidth={0}
							>
								{data.map((_, i) => (
									<Cell key={i} fill={COLORS[i]} />
								))}
							</Pie>
							<Tooltip
								formatter={(value, name) =>
									[`${value} (${data.find((d) => d.name === name)?.pct}%)`, name]
								}
								contentStyle={{
									background: "oklch(var(--b2))",
									border: "1px solid oklch(var(--b3))",
									borderRadius: "0.5rem",
									fontSize: "0.75rem",
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Stats */}
				<div className="flex flex-col gap-3 flex-1">
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm">
							<span className="w-3 h-3 rounded-full bg-success inline-block" />
							Vitórias
						</span>
						<span className="font-bold text-success">
							{wins} <span className="text-base-content/50 font-normal">({winPct}%)</span>
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

			<WinRateBar winPct={winPct} />
		</StatCard>
	);
}

import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { getWinner, type SF6Replay } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import StatRow from "./ui/StatRow";
import WinRateBar from "./ui/WinRateBar";

interface Props {
	replays: SF6Replay[];
	userId: string;
}

interface CharStat {
	name: string;
	toolName: string;
	total: number;
	wins: number;
	losses: number;
	winRate: number;
	priorityScore: number;
}

function findUserSide(replay: SF6Replay, userId: string): 1 | 2 | null {
	if (replay.player1_info.player.short_id.toString() === userId) return 1;
	if (replay.player2_info.player.short_id.toString() === userId) return 2;
	if (replay.player1_info.player.fighter_id === userId) return 1;
	if (replay.player2_info.player.fighter_id === userId) return 2;
	return null;
}

function buildStats(replays: SF6Replay[], userId: string): CharStat[] {
	const map = new Map<string, CharStat>();

	for (const replay of replays) {
		const side = findUserSide(replay, userId);
		if (side === null) continue;

		const opponent = side === 1 ? replay.player2_info : replay.player1_info;
		const key = opponent.playing_character_tool_name;

		if (!map.has(key)) {
			map.set(key, {
				name: opponent.playing_character_name,
				toolName: key,
				total: 0,
				wins: 0,
				losses: 0,
				winRate: 0,
				priorityScore: 0,
			});
		}

		const stat = map.get(key)!;
		stat.total++;
		getWinner(replay) === side ? stat.wins++ : stat.losses++;
		stat.winRate = Math.round((stat.wins / stat.total) * 100);
		const lossRate = stat.losses / stat.total;
		const winRateWeight = stat.winRate >= 50 ? 0.1 : 2.0;
		stat.priorityScore = stat.total * lossRate * winRateWeight;
	}

	return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";
const MEDALS = ["🥇", "🥈", "🥉"];

function TrainingCard({ stat, rank }: { stat: CharStat; rank: number }) {
	const lossRate = 100 - stat.winRate;

	return (
		<div className="card bg-base-100 border border-base-300 flex-1 min-w-0">
			<div className="card-body p-3 gap-2 items-center text-center">
				<span className="text-2xl">{MEDALS[rank]}</span>

				<div className="relative w-20 h-20">
					<img
						src={`${SF6_BASE}/material/character/character_${stat.toolName}_l.png`}
						alt={stat.name}
						className="w-full h-full object-contain"
					/>
				</div>

				<p className="font-bold text-sm">{stat.name}</p>

				<div className="flex flex-col gap-1 w-full">
					<StatRow label="Batalhas" value={stat.total} />
					<StatRow
						label="Win rate"
						value={`${stat.winRate}%`}
						valueClassName={stat.winRate >= 50 ? "text-success" : "text-error"}
					/>
					<StatRow label="Derrotas" value={stat.losses} valueClassName="text-error" />
				</div>

				{/* Loss rate bar: track=success, fill=error */}
				<div className="w-full h-1.5 rounded-full bg-success overflow-hidden">
					<div className="h-full bg-error rounded-full" style={{ width: `${lossRate}%` }} />
				</div>
				<p className="text-[10px] text-base-content/40">{lossRate}% de derrotas</p>
			</div>
		</div>
	);
}

export default function OpponentChart({ replays, userId }: Props) {
	const stats = buildStats(replays, userId);
	if (stats.length === 0) return null;

	const trainingTargets = Array.from(stats)
		.sort((a, b) => b.priorityScore - a.priorityScore)
		.slice(0, 3);

	return (
		<div className="flex flex-col gap-4">
			{/* Training recommendations */}
			<StatCard>
				<SectionTitle subtitle="Baseado na frequência de batalhas × taxa de derrota">
					Personagens para treinar
				</SectionTitle>
				<div className="flex gap-3">
					{trainingTargets.map((stat, i) => (
						<TrainingCard key={stat.toolName} stat={stat} rank={i} />
					))}
				</div>
			</StatCard>

			{/* Bar chart + ranking */}
			<StatCard>
				<SectionTitle>Adversários mais enfrentados</SectionTitle>

				<ResponsiveContainer width="100%" height={Math.max(180, stats.length * 32)}>
					<BarChart
						data={stats}
						layout="vertical"
						margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
						barSize={16}
					>
						<XAxis type="number" hide />
						<YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
						<Tooltip
							cursor={{ fill: "oklch(var(--b3))" }}
							contentStyle={{
								background: "oklch(var(--b2))",
								border: "1px solid oklch(var(--b3))",
								borderRadius: "0.5rem",
								fontSize: "0.75rem",
							}}
							formatter={(_value, _name, props) => {
								const s = props.payload as CharStat;
								return [
									`${s.total} batalhas  •  ${s.wins}W / ${s.losses}L  •  ${s.winRate}% WR`,
									s.name,
								];
							}}
						/>
						<Bar dataKey="total" radius={[0, 4, 4, 0]}>
							{stats.map((s) => (
								<Cell
									key={s.toolName}
									fill={s.winRate >= 50 ? "oklch(var(--su))" : "oklch(var(--er))"}
									fillOpacity={0.75}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>

				<div className="overflow-x-auto">
					<table className="table table-xs w-full">
						<thead>
							<tr>
								<th>#</th>
								<th>Personagem</th>
								<th className="text-center">Batalhas</th>
								<th className="text-center">W</th>
								<th className="text-center">L</th>
								<th className="text-center">WR%</th>
							</tr>
						</thead>
						<tbody>
							{stats.map((s, i) => (
								<tr key={s.toolName} className="hover">
									<td className="text-base-content/40 font-mono">{i + 1}</td>
									<td>
										<div className="flex items-center gap-2">
											<img
												src={`${SF6_BASE}/material/character/character_${s.toolName}_l.png`}
												alt={s.name}
												className="w-8 h-8 object-contain"
											/>
											<span className="font-medium">{s.name}</span>
										</div>
									</td>
									<td className="text-center font-semibold">{s.total}</td>
									<td className="text-center text-success font-semibold">{s.wins}</td>
									<td className="text-center text-error font-semibold">{s.losses}</td>
									<td className="text-center">
										<span className={`badge badge-sm ${s.winRate >= 50 ? "badge-success" : "badge-error"}`}>
											{s.winRate}%
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</StatCard>
		</div>
	);
}

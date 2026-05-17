"use client";

import { useState, useCallback } from "react";
import clsx from "clsx";
import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CharStat, CharacterOption, TrainingSuggestion } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import StatRow from "./ui/StatRow";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";
const MEDALS = ["🥇", "🥈", "🥉"];

function TrainingCard({ stat, rank }: { stat: TrainingSuggestion; rank: number }) {
	const lossRate = 100 - stat.win_rate;

	return (
		<div className="card bg-base-100 border border-base-300 flex-1 min-w-0">
			<div className="card-body p-3 gap-2 items-center text-center">
				<span className="text-2xl">{MEDALS[rank]}</span>

				<div className="relative w-20 h-20">
					<img
						src={`${SF6_BASE}/material/character/character_${stat.tool_name}_l.png`}
						alt={stat.name}
						className="w-full h-full object-contain"
					/>
				</div>

				<p className="font-bold text-sm">{stat.name}</p>

				<div className="flex flex-col gap-1 w-full">
					<StatRow label="Batalhas" value={stat.total} />
					<StatRow
						label="Win rate"
						value={`${stat.win_rate}%`}
						valueClassName={stat.win_rate >= 50 ? "text-success" : "text-error"}
					/>
					<StatRow label="Derrotas" value={stat.losses} valueClassName="text-error" />
					<StatRow
						label="Derrota limpa"
						value={stat.clean_losses}
						valueClassName={stat.clean_losses > 0 ? "text-error font-bold" : "text-base-content/40"}
					/>
					<StatRow
						label="Derrota disputada"
						value={stat.close_losses}
						valueClassName="text-base-content/60"
					/>
					{stat.usage_rate > 0 && (
						<StatRow
							label="Uso global"
							value={`${stat.usage_rate.toFixed(1)}%`}
							valueClassName="text-info"
						/>
					)}
					{stat.matchup_wr > 0 && (
						<StatRow
							label="Matchup"
							value={`${stat.matchup_wr.toFixed(1)}%`}
							valueClassName={stat.matchup_wr >= 50 ? "text-success" : "text-error"}
						/>
					)}
				</div>

				<div className="w-full h-1.5 rounded-full bg-success overflow-hidden">
					<div className="h-full bg-error rounded-full" style={{ width: `${lossRate}%` }} />
				</div>
				<p className="text-[10px] text-base-content/40">{lossRate}% de derrotas</p>
			</div>
		</div>
	);
}

interface Props {
	data: CharStat[] | null;
	userId: string;
	characters: CharacterOption[];
}

export default function OpponentChart({ data: initialData, userId, characters }: Props) {
	const [selected, setSelected] = useState("");
	const [stats, setStats] = useState(initialData);
	const [training, setTraining] = useState<TrainingSuggestion[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [trainingLoaded, setTrainingLoaded] = useState(false);

	// Fetch training suggestions on mount
	const fetchTraining = useCallback((character: string) => {
		const q = character ? `?character=${character}` : "";
		fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/training${q}`)
			.then((r) => r.json())
			.then((d) => setTraining(d))
			.catch(() => {});
	}, [userId]);

	// Load training on first render
	if (!trainingLoaded) {
		setTrainingLoaded(true);
		fetchTraining("");
	}

	const fetchOpponents = useCallback((character: string) => {
		setLoading(true);
		const q = character ? `?character=${character}` : "";
		Promise.all([
			fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/opponents${q}`).then((r) => r.json()),
			fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/training${q}`).then((r) => r.json()),
		])
			.then(([oppData, trainData]) => {
				setStats(oppData);
				setTraining(trainData);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [userId]);

	function handleChange(value: string) {
		setSelected(value);
		fetchOpponents(value);
	}

	if (!stats || stats.length === 0) return null;

	const trainingTargets = training
		? [...training].sort((a, b) => b.priority_score - a.priority_score).slice(0, 3)
		: [...stats].sort((a, b) => b.priority_score - a.priority_score).slice(0, 3).map((s) => ({
			...s,
			usage_rate: 0,
			matchup_wr: 0,
		}));

	return (
		<div className="flex flex-col gap-4">
			{/* Character filter */}
			{characters.length > 1 && (
				<div className="flex items-center gap-2">
					<span className="text-sm text-base-content/60">Jogando com:</span>
					<select
						className="select select-sm select-bordered"
						value={selected}
						onChange={(e) => handleChange(e.target.value)}
					>
						<option value="">Todos os personagens</option>
						{characters.map((c) => (
							<option key={c.tool_name} value={c.tool_name}>
								{c.name}
							</option>
						))}
					</select>
					{loading && <span className="loading loading-spinner loading-xs" />}
				</div>
			)}

			<StatCard>
				<SectionTitle subtitle="Baseado em derrotas pessoais, uso global do personagem e matchup oficial">
					Personagens para treinar
				</SectionTitle>
				<div className="flex gap-3">
					{trainingTargets.map((stat, i) => (
						<TrainingCard key={stat.tool_name} stat={stat} rank={i} />
					))}
				</div>
			</StatCard>

			<StatCard>
				<SectionTitle>Adversarios mais enfrentados</SectionTitle>

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
							formatter={(_value: any, _name: any, props: any) => {
								const s = props.payload as CharStat;
								return [
									`${s.total} batalhas  •  ${s.wins}W / ${s.losses}L  •  ${s.win_rate}% WR`,
									s.name,
								];
							}}
						/>
						<Bar dataKey="total" radius={[0, 4, 4, 0]}>
							{stats.map((s) => (
								<Cell
									key={s.tool_name}
									fill={s.win_rate >= 50 ? "oklch(var(--su))" : "oklch(var(--er))"}
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
								<tr key={s.tool_name} className="hover">
									<td className="text-base-content/40 font-mono">{i + 1}</td>
									<td>
										<div className="flex items-center gap-2">
											<img
												src={`${SF6_BASE}/material/character/character_${s.tool_name}_l.png`}
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
										<span className={clsx("badge badge-sm", s.win_rate >= 50 ? "badge-success" : "badge-error")}>
											{s.win_rate}%
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

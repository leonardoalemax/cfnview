"use client";

import { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import type {
	CharStat,
	TrainingSuggestion,
} from "../lib/types";
import CharacterIcon from "./ui/CharacterIcon";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import StatRow from "./ui/StatRow";
const MEDALS = ["🥇", "🥈", "🥉"];

function TrainingCard({
	stat,
	rank,
	detailed,
}: {
	stat: TrainingSuggestion;
	rank: number;
	detailed: boolean;
}) {
	const lossRate = 100 - stat.win_rate;

	return (
		<StatCard className='card flex-1 min-w-0'>
			<div className='card-body p-3 gap-2 items-center text-center'>
				<span className='text-2xl'>{MEDALS[rank]}</span>

				<CharacterIcon
					toolName={stat.tool_name}
					className='w-20 h-20'
				/>

				<p className='font-bold text-sm'>{stat.name}</p>

				<div className='w-full h-1.5 rounded-full bg-success overflow-hidden'>
					<div
						className='h-full bg-error rounded-full'
						style={{ width: `${lossRate}%` }}
					/>
				</div>
				<p className='text-[10px] text-base-content/40'>
					{lossRate}% de derrotas
				</p>

				{detailed && (
					<div className='flex flex-col gap-1 w-full'>
						<StatRow label='Batalhas' value={stat.total} />
						<StatRow
							label='Win rate'
							value={`${stat.win_rate}%`}
							valueClassName={
								stat.win_rate >= 50 ? "text-success" : "text-error"
							}
						/>
						<StatRow
							label='Derrotas'
							value={stat.losses}
							valueClassName='text-error'
						/>
						<StatRow
							label='Derrota limpa'
							value={stat.clean_losses}
							valueClassName={
								stat.clean_losses > 0
									? "text-error font-bold"
									: "text-base-content/40"
							}
						/>
						<StatRow
							label='Derrota disputada'
							value={stat.close_losses}
							valueClassName='text-base-content/60'
						/>
						{stat.usage_rate > 0 && (
							<StatRow
								label='Uso global'
								value={`${stat.usage_rate.toFixed(1)}%`}
								valueClassName='text-info'
							/>
						)}
						{stat.matchup_wr > 0 && (
							<StatRow
								label='Matchup'
								value={`${stat.matchup_wr.toFixed(1)}%`}
								valueClassName={
									stat.matchup_wr >= 50
										? "text-success"
										: "text-error"
								}
							/>
						)}
					</div>
				)}
			</div>
		</StatCard>
	);
}

interface Props {
	data: CharStat[] | null;
	userId: string;
	selectedCharacter: string;
	/** Which section to render: "training" or "list" */
	section: "training" | "list";
}

const INITIAL_VISIBLE = 5;

export default function OpponentChart({
	data,
	userId,
	selectedCharacter,
	section,
}: Props) {
	const [training, setTraining] = useState<TrainingSuggestion[] | null>(null);
	const [expanded, setExpanded] = useState(false);
	const [trainingDetailed, setTrainingDetailed] = useState(false);

	// Fetch training suggestions when character changes
	useEffect(() => {
		const q = selectedCharacter ? `?character=${selectedCharacter}` : "";
		fetch(
			`${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/training${q}`,
		)
			.then((r) => r.json())
			.then((d) => setTraining(d))
			.catch(() => {});
	}, [userId, selectedCharacter]);

	if (!data || data.length === 0) return null;

	if (section === "training") {
		const trainingTargets = training
			? [...training]
					.sort((a, b) => b.priority_score - a.priority_score)
					.slice(0, 3)
			: [...data]
					.sort((a, b) => b.priority_score - a.priority_score)
					.slice(0, 3)
					.map((s) => ({
						...s,
						usage_rate: 0,
						matchup_wr: 0,
					}));

		return (
			<StatCard>
				<SectionTitle subtitle='Baseado em derrotas pessoais, uso global do personagem e matchup oficial'>
					Personagens para treinar
				</SectionTitle>
				<div className='flex gap-3'>
					{trainingTargets.map((stat, i) => (
						<TrainingCard
							key={stat.tool_name}
							stat={stat}
							rank={i}
							detailed={trainingDetailed}
						/>
					))}
				</div>
				<button
					type='button'
					className='btn btn-ghost btn-sm w-full mt-2 text-xs'
					onClick={() => setTrainingDetailed((v) => !v)}
				>
					{trainingDetailed ? "Ver menos informações" : "Ver mais informações"}
				</button>
				{trainingDetailed && (
					<p className='text-[10px] text-base-content/40 text-center mt-2 leading-relaxed'>
						A prioridade é calculada com base nas suas derrotas contra cada personagem,
						dando mais peso para derrotas limpas (3x) e disputadas (1.5x).
						Personagens mais usados globalmente no seu ranking recebem prioridade maior,
						assim como matchups oficialmente desfavoráveis para o seu personagem.
					</p>
				)}
			</StatCard>
		);
	}

	const visible = expanded ? data : data.slice(0, INITIAL_VISIBLE);
	const hasMore = data.length > INITIAL_VISIBLE;

	return (
		<StatCard>
			<ul className='list'>
				<li className='p-4 pb-2 text-xs opacity-60 tracking-wide'>
					Adversários mais enfrentados
				</li>
				{visible.map((s, i) => (
					<li key={s.tool_name} className='list-row'>
						<div className='text-4xl font-thin opacity-30 tabular-nums'>
							{String(i + 1).padStart(2, "0")}
						</div>
						<div>
							<CharacterIcon
								toolName={s.tool_name}
								className='size-10'
							/>
						</div>
						<div className='list-col-grow'>
							<div className='font-medium'>{s.name}</div>
							<div className='text-xs uppercase font-semibold opacity-60'>
								{s.total} batalhas — {s.wins}W / {s.losses}L
							</div>
						</div>
						<span
							className={clsx(
								"badge badge-sm font-bold",
								s.win_rate >= 50
									? "badge-success"
									: "badge-error",
							)}>
							{s.win_rate}%
						</span>
					</li>
				))}
			</ul>
			{hasMore && (
				<button
					type='button'
					className='btn btn-ghost btn-sm w-full mt-2 text-xs'
					onClick={() => setExpanded((v) => !v)}
				>
					{expanded ? "Ver menos" : `Ver mais (${data.length - INITIAL_VISIBLE})`}
				</button>
			)}
		</StatCard>
	);
}

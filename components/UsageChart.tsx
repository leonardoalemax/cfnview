"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CharUsageEntry, UsageSnapshot } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import CharacterIcon from "./ui/CharacterIcon";
import StatsFilters from "./ui/StatsFilters";

function toMonthOption(yyyymm: string) {
	const y = parseInt(yyyymm.slice(0, 4), 10);
	const m = parseInt(yyyymm.slice(4, 6), 10) - 1;
	return {
		value: yyyymm,
		label: new Date(y, m).toLocaleString("pt-BR", {
			month: "short",
			year: "numeric",
		}),
	};
}

function UsageBar({ entry, max }: { entry: CharUsageEntry; max: number }) {
	const delta = entry.play_rate - entry.previous_rate;
	const pct = entry.play_rate / max;
	return (
		<div className='flex items-center gap-2 min-w-0'>
			<CharacterIcon
				toolName={entry.character_tool_name}
				className='w-8 h-8 shrink-0'
			/>
			<div className='flex-1 min-w-0'>
				<div className='flex justify-between text-xs mb-0.5'>
					<span className='font-medium truncate'>
						{entry.character_alpha}
					</span>
					<span className='flex gap-2 shrink-0 ml-2'>
						{delta !== 0 && (
							<span
								className={
									delta > 0 ? "text-success" : "text-error"
								}>
								{delta > 0 ? "+" : ""}
								{delta.toFixed(2)}%
							</span>
						)}
						<span className='text-base-content/70 font-semibold'>
							{entry.play_rate.toFixed(2)}%
						</span>
					</span>
				</div>
				<div className='h-2 rounded-full bg-base-300 overflow-hidden'>
					<div
						className='h-full rounded-full bg-primary transition-all duration-300'
						style={{ width: `${pct * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
}

interface UsageChartProps {
	months: string[];
	initialData: UsageSnapshot | null;
	month: string;
	type: string;
	league: string; // alpha (ex: "MASTER") ou "" para o primeiro disponível
}

export default function UsageChart({
	months,
	initialData,
	month,
	type,
	league,
}: UsageChartProps) {
	const router = useRouter();
	const monthOptions = months.map(toMonthOption);

	const [data, setData] = useState<UsageSnapshot | null>(initialData);
	const [loading, setLoading] = useState(false);

	// Sincroniza com nova prop quando o servidor renderiza outro mês
	useEffect(() => {
		setData(initialData);
	}, [initialData, month]);

	function navigate(nextMonth: string, nextType: string, nextLeague: string) {
		const l = nextLeague ? encodeURIComponent(nextLeague) : "all";
		router.push(`/dados/usage/${nextMonth}/${nextType}/${l}`, {
			scroll: false,
		});
	}

	const allLeagues = data?.leagues ?? [];
	const opTypeInt = parseInt(type, 10);
	const filteredLeagues = allLeagues.filter(
		(l) => l.operation_type === opTypeInt,
	);
	const leagueTabs = allLeagues
		.filter((l) => l.operation_type === 0)
		.sort((a, b) => a.league_rank - b.league_rank)
		.map((l) => ({ rank: l.league_rank, alpha: l.league_alpha }));

	const activeLeague =
		filteredLeagues.find((l) => l.league_alpha === league) ??
		filteredLeagues[0];
	const entries = activeLeague?.entries ?? [];
	const max =
		entries.length > 0 ? Math.max(...entries.map((e) => e.play_rate)) : 1;

	return (
		<>
			{/* Filtros — bloco separado, fora do resultado */}
			{allLeagues.length > 0 && (
				<StatCard>
					<StatsFilters
						monthOptions={monthOptions}
						selectedMonth={month}
						onMonthChange={(v) => navigate(v, type, league)}
						selectedInputType={type}
						onInputTypeChange={(v) => navigate(month, v, league)}
						leagueTabs={leagueTabs}
						selectedLeague={activeLeague?.league_alpha ?? ""}
						onLeagueChange={(v) => navigate(month, type, v)}
					/>
				</StatCard>
			)}

			{/* Resultado */}
			<StatCard>
				<SectionTitle>Uso de personagens</SectionTitle>

				{loading && (
					<div className='flex justify-center py-8'>
						<span className='loading loading-spinner loading-md' />
					</div>
				)}

				{!loading && entries.length === 0 && (
					<p className='text-sm text-base-content/40 text-center py-8'>
						Sem dados para este período.
					</p>
				)}

				{!loading && entries.length > 0 && (
					<div className='flex flex-col gap-3'>
						{entries.map((entry) => (
							<UsageBar
								key={entry.character_tool_name}
								entry={entry}
								max={max}
							/>
						))}
					</div>
				)}
			</StatCard>
		</>
	);
}

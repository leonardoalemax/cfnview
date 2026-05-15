"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { CharUsageEntry, UsageSnapshot } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import StatsFilters from "./ui/StatsFilters";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function toMonthOption(yyyymm: string) {
	const y = parseInt(yyyymm.slice(0, 4), 10);
	const m = parseInt(yyyymm.slice(4, 6), 10) - 1;
	return {
		value: yyyymm,
		label: new Date(y, m).toLocaleString("pt-BR", { month: "short", year: "numeric" }),
	};
}

function UsageBar({ entry, max }: { entry: CharUsageEntry; max: number }) {
	const delta = entry.play_rate - entry.previous_rate;
	const pct = entry.play_rate / max;
	return (
		<div className="flex items-center gap-2 min-w-0">
			<img
				src={`${SF6_BASE}/material/character/character_${entry.character_tool_name}_l.png`}
				alt={entry.character_alpha}
				className="w-8 h-8 object-contain shrink-0"
			/>
			<div className="flex-1 min-w-0">
				<div className="flex justify-between text-xs mb-0.5">
					<span className="font-medium truncate">{entry.character_alpha}</span>
					<span className="flex gap-2 shrink-0 ml-2">
						{delta !== 0 && (
							<span className={delta > 0 ? "text-success" : "text-error"}>
								{delta > 0 ? "+" : ""}{delta.toFixed(2)}%
							</span>
						)}
						<span className="text-base-content/70 font-semibold">{entry.play_rate.toFixed(2)}%</span>
					</span>
				</div>
				<div className="h-2 rounded-full bg-base-300 overflow-hidden">
					<div
						className="h-full rounded-full bg-primary transition-all duration-300"
						style={{ width: `${pct * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
}

interface UsageChartProps {
	userId: string;
	months: string[];
	initialData: UsageSnapshot | null;
}

export default function UsageChart({ userId, months, initialData }: UsageChartProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const monthOptions = months.map(toMonthOption);
	const selectedMonth = searchParams.get("m") ?? (months[0] ?? "");
	const selectedLeague = searchParams.get("l") ?? "";
	const selectedOpType = searchParams.get("t") ?? "0";

	const [data, setData] = useState<UsageSnapshot | null>(initialData);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (selectedMonth === (months[0] ?? "") && initialData) return;
		let cancelled = false;
		let retries = 0;

		async function load() {
			setLoading(true);
			while (retries <= 6) {
				const res = await fetch(`/api/usage/${selectedMonth}`);
				const d: UsageSnapshot = await res.json();
				if (cancelled) return;
				if (d.leagues && d.leagues.length > 0) {
					setData(d);
					setLoading(false);
					return;
				}
				retries++;
				if (retries > 6) break;
				await new Promise((r) => setTimeout(r, 2500));
			}
			if (!cancelled) { setData(null); setLoading(false); }
		}

		setData(null);
		load();
		return () => { cancelled = true; };
	}, [selectedMonth]);

	function setParam(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());
		params.set(key, value);
		router.push(`/battlelog/${userId}/usage?${params.toString()}`, { scroll: false });
	}

	const allLeagues = data?.leagues ?? [];
	const opTypeInt = parseInt(selectedOpType, 10);
	const filteredLeagues = allLeagues.filter((l) => l.operation_type === opTypeInt);
	const leagueTabs = allLeagues
		.filter((l) => l.operation_type === 0)
		.sort((a, b) => a.league_rank - b.league_rank)
		.map((l) => ({ rank: l.league_rank, alpha: l.league_alpha }));

	const activeLeague = filteredLeagues.find((l) => l.league_alpha === selectedLeague) ?? filteredLeagues[0];
	const entries = activeLeague?.entries ?? [];
	const max = entries.length > 0 ? Math.max(...entries.map((e) => e.play_rate)) : 1;

	return (
		<StatCard>
			<SectionTitle>Uso de personagens</SectionTitle>

			{allLeagues.length > 0 && (
				<StatsFilters
					monthOptions={monthOptions}
					selectedMonth={selectedMonth}
					onMonthChange={(v) => setParam("m", v)}
					selectedInputType={selectedOpType}
					onInputTypeChange={(v) => setParam("t", v)}
					leagueTabs={leagueTabs}
					selectedLeague={activeLeague?.league_alpha ?? ""}
					onLeagueChange={(v) => setParam("l", v)}
				/>
			)}

			{loading && (
				<div className="flex justify-center py-8">
					<span className="loading loading-spinner loading-md" />
				</div>
			)}

			{!loading && entries.length === 0 && (
				<p className="text-sm text-base-content/40 text-center py-8">
					Sem dados para este período.
				</p>
			)}

			{!loading && entries.length > 0 && (
				<div className="flex flex-col gap-3">
					{entries.map((entry) => (
						<UsageBar key={entry.character_tool_name} entry={entry} max={max} />
					))}
				</div>
			)}
		</StatCard>
	);
}

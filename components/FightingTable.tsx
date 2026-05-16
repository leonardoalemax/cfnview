"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FightingSnapshot, LeagueFighting, FightingRecord } from "../lib/types";
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

function winRateColor(val: string): string {
	if (val === "-") return "";
	const n = parseFloat(val);
	if (isNaN(n)) return "";
	if (n >= 6) return "text-success font-semibold";
	if (n <= 4) return "text-error font-semibold";
	return "text-base-content/70";
}

function winRateBg(val: string): string {
	if (val === "-") return "";
	const n = parseFloat(val);
	if (isNaN(n)) return "";
	if (n >= 6) return "#1a3a22";
	if (n <= 4) return "#3a1a1a";
	return "";
}

const HIGHLIGHT = "#1e3d5c";
const HIGHLIGHT_CELL = "#1e5c80";

function inputTypeToFilter(v: string): string | null {
	if (v === "1") return "C";
	if (v === "2") return "M";
	return null;
}

interface Props {
	months: string[];
	initialData: FightingSnapshot | null;
	month: string;
	type: string;
	league: string; // league_rank como string ("0", "1"...) ou "" para o primeiro
}

export default function FightingTable({ months, initialData, month, type, league }: Props) {
	const router = useRouter();
	const monthOptions = months.map(toMonthOption);

	const [data, setData] = useState<FightingSnapshot | null>(initialData);
	const [loading, setLoading] = useState(false);
	const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

	useEffect(() => {
		setData(initialData);
	}, [initialData, month]);

	function navigate(nextMonth: string, nextType: string, nextLeague: string) {
		const l = nextLeague ? encodeURIComponent(nextLeague) : "all";
		router.push(`/dados/matchups/${nextMonth}/${nextType}/${l}`, { scroll: false });
	}

	const leagues = data?.leagues
		? [...data.leagues].sort((a, b) => a.league_rank - b.league_rank)
		: [];

	const leagueTabs = leagues.map((l) => ({ rank: l.league_rank, alpha: String(l.league_rank) }));

	const activeLeague: LeagueFighting | undefined =
		leagues.find((l) => String(l.league_rank) === league) ?? leagues[0];

	const inputFilter = inputTypeToFilter(type);
	const allOpponents = activeLeague?.opponent_header ?? [];
	const allRecords: FightingRecord[] = activeLeague?.records ?? [];

	const opponents = inputFilter ? allOpponents.filter((h) => h.input_type === inputFilter) : allOpponents;
	const records: FightingRecord[] = inputFilter ? allRecords.filter((r) => r.input_type === inputFilter) : allRecords;

	const fullHeaderIndices = opponents.map((op) =>
		allOpponents.findIndex((h) => h.id === op.id && h.input_type === op.input_type),
	);

	const activeLeagueAlpha = activeLeague ? String(activeLeague.league_rank) : "";

	return (
		<>
			{/* Filtros — bloco separado */}
			{leagues.length > 0 && (
				<StatCard>
					<StatsFilters
						monthOptions={monthOptions}
						selectedMonth={month}
						onMonthChange={(v) => navigate(v, type, league)}
						selectedInputType={type}
						onInputTypeChange={(v) => navigate(month, v, league)}
						leagueTabs={leagueTabs}
						selectedLeague={activeLeagueAlpha}
						onLeagueChange={(v) => navigate(month, type, v)}
					/>
				</StatCard>
			)}

			{/* Resultado */}
			<StatCard>
				<SectionTitle>Matchups</SectionTitle>

				{loading && (
					<div className="flex justify-center py-8">
						<span className="loading loading-spinner loading-md" />
					</div>
				)}

				{!loading && records.length === 0 && (
					<p className="text-sm text-base-content/40 text-center py-8">
						Sem dados para este período.
					</p>
				)}

				{!loading && records.length > 0 && (
					<div className="overflow-x-auto -mx-4 sm:mx-0" onMouseLeave={() => setHovered(null)}>
						<table className="table table-xs text-xs min-w-max">
							<thead>
								<tr>
									<th className="sticky left-0 z-10 bg-base-200 min-w-[120px]">Personagem</th>
									<th className="text-center whitespace-nowrap">Total</th>
									{opponents.map((op, ci) => (
										<th
											key={`${op.id}-${op.input_type}`}
											className="text-center p-1"
											style={{ backgroundColor: hovered?.col === ci ? HIGHLIGHT : undefined }}
										>
											<div className="flex flex-col items-center gap-0.5">
												<img
													src={`${SF6_BASE}/material/character/character_${op.tool_name}_l.png`}
													alt={op.name_alpha}
													className="w-7 h-7 object-contain"
												/>
												<img
													src={`${SF6_BASE}/common/icon_controltype${op.input_type === "C" ? 1 : 2}.png`}
													alt={op.input_type}
													className="w-3 h-3 object-contain opacity-70"
												/>
											</div>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{records
									.slice()
									.sort((a, b) => b.win_rate - a.win_rate)
									.map((rec, ri) => (
										<tr key={`${rec.id}-${rec.input_type}`}>
											<td className="sticky left-0 z-10 font-medium whitespace-nowrap bg-base-100"
											style={{ backgroundColor: hovered?.row === ri ? HIGHLIGHT : undefined }}>
												<div className="flex items-center gap-1.5">
													<img
														src={`${SF6_BASE}/material/character/character_${rec.tool_name}_l.png`}
														alt={rec.name_alpha}
														className="w-6 h-6 object-contain shrink-0"
													/>
													<span className="truncate max-w-[72px]">{rec.name_alpha}</span>
													<img
														src={`${SF6_BASE}/common/icon_controltype${rec.input_type === "C" ? 1 : 2}.png`}
														alt={rec.input_type}
														className="w-3 h-3 object-contain opacity-70 shrink-0 ml-auto"
													/>
												</div>
											</td>
											<td
												className={clsx("text-center font-bold", winRateColor(rec.total))}
												style={{ backgroundColor: hovered?.row === ri ? HIGHLIGHT : winRateBg(rec.total) }}

											>
												{rec.total}
											</td>
											{fullHeaderIndices.map((idx, ci) => {
												const val = idx >= 0 ? (rec.values[idx]?.val ?? "-") : "-";
												const isIntersection = hovered?.row === ri && hovered?.col === ci;
												const isHighlighted = !isIntersection && (hovered?.row === ri || hovered?.col === ci);
												return (
													<td
														key={ci}
														className={clsx("text-center cursor-default", winRateColor(val))}
														style={{
															backgroundColor: isIntersection
																? HIGHLIGHT_CELL
																: isHighlighted
																	? HIGHLIGHT
																	: winRateBg(val),
														}}
														onMouseEnter={() => setHovered({ row: ri, col: ci })}
													>
														{val}
													</td>
												);
											})}
										</tr>
									))}
							</tbody>
						</table>
					</div>
				)}
			</StatCard>
		</>
	);
}

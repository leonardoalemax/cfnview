import { getWinner, type SF6Replay } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

interface Props {
	replays: SF6Replay[];
	userId: string;
}

interface DayStat {
	wins: number;
	total: number;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const DAY_COL_W = 28;

function findUserSide(replay: SF6Replay, userId: string): 1 | 2 | null {
	if (replay.player1_info.player.short_id.toString() === userId) return 1;
	if (replay.player2_info.player.short_id.toString() === userId) return 2;
	if (replay.player1_info.player.fighter_id === userId) return 1;
	if (replay.player2_info.player.fighter_id === userId) return 2;
	return null;
}

function toDateKey(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function winRateColor(wins: number, total: number): string {
	const pct = wins / total;
	const h = pct <= 0.5 ? pct * 2 * 30 : 30 + (pct - 0.5) * 2 * 90;
	return `hsl(${Math.round(h)}, 75%, 45%)`;
}

function buildData(replays: SF6Replay[], userId: string) {
	const byDay = new Map<string, DayStat>();
	const byWeekday: DayStat[] = Array.from({ length: 7 }, () => ({ wins: 0, total: 0 }));

	for (const replay of replays) {
		const side = findUserSide(replay, userId);
		if (!side) continue;
		const date = new Date(replay.uploaded_at * 1000);
		const key = toDateKey(date);
		if (!byDay.has(key)) byDay.set(key, { wins: 0, total: 0 });
		const s = byDay.get(key)!;
		s.total++;
		const won = getWinner(replay) === side;
		if (won) s.wins++;

		const wd = byWeekday[date.getDay()];
		wd.total++;
		if (won) wd.wins++;
	}

	// Start on the Sunday of the week 3 months ago
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const start = new Date(today);
	start.setMonth(start.getMonth() - 3);
	start.setDate(start.getDate() - start.getDay());

	// Build week columns
	const weeks: Array<Array<{ date: Date; key: string; stat: DayStat | null; isFuture: boolean }>> = [];
	const cur = new Date(start);

	while (cur <= today) {
		const week = [];
		for (let d = 0; d < 7; d++) {
			const date = new Date(cur);
			week.push({
				date,
				key: toDateKey(date),
				stat: byDay.get(toDateKey(date)) ?? null,
				isFuture: date > today,
			});
			cur.setDate(cur.getDate() + 1);
		}
		weeks.push(week);
	}

	// Month label for each week column
	const monthLabels: Array<{ label: string; col: number }> = [];
	let lastMonth = -1;
	weeks.forEach((week, col) => {
		const m = week[0].date.getMonth();
		if (m !== lastMonth) {
			monthLabels.push({ label: MONTHS[m], col });
			lastMonth = m;
		}
	});

	return { weeks, monthLabels, byDay, byWeekday };
}

function WeekdayChart({ byWeekday }: { byWeekday: DayStat[] }) {
	return (
		<StatCard bodyClassName="gap-3">
			<SectionTitle>Win rate por dia da semana</SectionTitle>
			<div className="flex flex-col gap-2">
				{byWeekday.map((stat, i) => {
					const wr = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : null;
					return (
						<div key={i} className="flex items-center gap-2">
							<span className="w-7 text-[11px] text-right text-base-content/50 shrink-0">
								{DAY_LABELS[i]}
							</span>
							<div className="flex-1 h-[18px] rounded bg-base-300 overflow-hidden">
								{wr !== null && (
									<div
										className="h-full rounded transition-all duration-300"
										style={{
											width: `${wr}%`,
											background: winRateColor(stat.wins, stat.total),
										}}
									/>
								)}
							</div>
							<div className="w-[90px] text-[11px] shrink-0 flex gap-1.5 justify-end">
								{wr !== null ? (
									<>
										<span className="text-base-content/40">{stat.total}j</span>
										<span
											className="font-semibold"
											style={{ color: wr >= 50 ? "hsl(120,55%,45%)" : "hsl(0,65%,50%)" }}
										>
											{wr}%
										</span>
									</>
								) : (
									<span className="text-base-content/30">—</span>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</StatCard>
	);
}

export default function CalendarHeatmap({ replays, userId }: Props) {
	const { weeks, monthLabels, byDay, byWeekday } = buildData(replays, userId);

	let totalBattles = 0, totalWins = 0, activeDays = 0;
	byDay.forEach((s) => { totalBattles += s.total; totalWins += s.wins; activeDays++; });
	const overallWR = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;

	return (
		<div className="flex flex-col gap-4">
			<StatCard>
				<SectionTitle
					aside={
						<div className="flex gap-4 text-xs text-base-content/60">
							<span>{activeDays} dias ativos</span>
							<span>{totalBattles} batalhas</span>
							<span className={overallWR >= 50 ? "text-success font-semibold" : "text-error font-semibold"}>
								{overallWR}% WR geral
							</span>
						</div>
					}
				>
					Calendário de batalhas
				</SectionTitle>

				<div className="overflow-x-auto pb-1">
					<div style={{ display: "inline-block" }}>
						{/* Month labels row */}
						<div style={{ display: "flex", marginLeft: DAY_COL_W + GAP, height: 18, position: "relative" }}>
							{monthLabels.map(({ label, col }) => (
								<span
									key={col}
									style={{
										position: "absolute",
										left: col * STEP,
										fontSize: 11,
										lineHeight: "18px",
										color: "oklch(var(--bc) / 0.5)",
										whiteSpace: "nowrap",
									}}
								>
									{label}
								</span>
							))}
						</div>

						{/* Day labels + week grid */}
						<div style={{ display: "flex", gap: GAP }}>
							{/* Day-of-week labels */}
							<div style={{ display: "flex", flexDirection: "column", gap: GAP, width: DAY_COL_W }}>
								{DAY_LABELS.map((label, i) => (
									<div
										key={i}
										style={{
											height: CELL,
											fontSize: 10,
											lineHeight: `${CELL}px`,
											textAlign: "right",
											paddingRight: 4,
											color: "oklch(var(--bc) / 0.4)",
										}}
									>
										{i % 2 === 1 ? label : ""}
									</div>
								))}
							</div>

							{/* Week columns */}
							{weeks.map((week, wi) => (
								<div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
									{week.map((cell) => {
										const empty = !cell.stat || cell.isFuture;
										const bg = empty
											? "oklch(var(--b3))"
											: winRateColor(cell.stat!.wins, cell.stat!.total);

										const wr = cell.stat
											? Math.round((cell.stat.wins / cell.stat.total) * 100)
											: 0;
										const title = cell.stat
											? `${cell.key}: ${cell.stat.wins}W / ${cell.stat.total - cell.stat.wins}L (${wr}% WR)`
											: cell.key;

										return (
											<div
												key={cell.key}
												title={title}
												style={{
													width: CELL,
													height: CELL,
													background: bg,
													borderRadius: 2,
													opacity: cell.isFuture ? 0.15 : 1,
													cursor: cell.stat ? "default" : undefined,
												}}
											/>
										);
									})}
								</div>
							))}
						</div>

						{/* Legend */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 4,
								marginTop: 8,
								marginLeft: DAY_COL_W + GAP,
								justifyContent: "flex-end",
							}}
						>
							<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>0%</span>
							{[0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].map((v) => (
								<div
									key={v}
									style={{
										width: CELL,
										height: CELL,
										borderRadius: 2,
										background: winRateColor(v, 1),
									}}
								/>
							))}
							<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>100%</span>
						</div>
					</div>
				</div>
			</StatCard>

			<WeekdayChart byWeekday={byWeekday} />
		</div>
	);
}

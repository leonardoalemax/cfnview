import type { HourlyStats } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

function winRateColor(wins: number, total: number): string {
	if (total === 0) return "oklch(var(--b3))";
	const pct = wins / total;
	const h = pct <= 0.5 ? pct * 2 * 30 : 30 + (pct - 0.5) * 2 * 90;
	return `hsl(${Math.round(h)}, 75%, 40%)`;
}

function formatHour(h: number): string {
	return `${String(h).padStart(2, "0")}h`;
}

const CELL_W = 36;
const CELL_H = 40;
const GAP = 3;

export default function HourlyHeatmap({ data }: { data: HourlyStats | null }) {
	if (!data) return null;

	const hours = data.hours;
	const maxTotal = Math.max(...hours.map((h) => h.total), 1);

	return (
		<StatCard>
			<SectionTitle subtitle="Win rate por hora do dia">
				Heatmap por hora
			</SectionTitle>

			<div className="overflow-x-auto pb-1">
				<div
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(24, ${CELL_W}px)`,
						gap: GAP,
						minWidth: 24 * (CELL_W + GAP),
					}}
				>
					{hours.map((stat) => {
						const wr = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : null;
						const opacity = stat.total > 0 ? 0.3 + 0.7 * (stat.total / maxTotal) : 1;
						const bg = winRateColor(stat.wins, stat.total);

						return (
							<div
								key={stat.hour}
								title={
									stat.total > 0
										? `${formatHour(stat.hour)}: ${stat.wins}W / ${stat.total - stat.wins}L (${wr}% WR)`
										: `${formatHour(stat.hour)}: sem dados`
								}
								style={{
									width: CELL_W,
									height: CELL_H,
									background: bg,
									opacity,
									borderRadius: 4,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									gap: 1,
									cursor: stat.total > 0 ? "default" : undefined,
								}}
							>
								<span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", lineHeight: 1 }}>
									{formatHour(stat.hour)}
								</span>
								{wr !== null ? (
									<span style={{ fontSize: 11, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
										{wr}%
									</span>
								) : (
									<span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1 }}>—</span>
								)}
								{stat.total > 0 && (
									<span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>
										{stat.total}j
									</span>
								)}
							</div>
						);
					})}
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						marginTop: 8,
						justifyContent: "flex-end",
					}}
				>
					<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>0%</span>
					{[0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].map((v) => (
						<div
							key={v}
							style={{
								width: 12,
								height: 12,
								borderRadius: 2,
								background: winRateColor(v, 1),
							}}
						/>
					))}
					<span style={{ fontSize: 10, color: "oklch(var(--bc) / 0.5)" }}>100%</span>
				</div>
			</div>
		</StatCard>
	);
}

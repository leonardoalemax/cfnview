"use client";

import { useState } from "react";
import type { CalendarStat, HourlyStats, WeeklyHeatmap as WeeklyHeatmapData } from "../lib/types";
import HourlyHeatmap from "./HourlyHeatmap";
import WeeklyHeatmap from "./WeeklyHeatmap";
import CalendarHeatmap from "./CalendarHeatmap";
import WeekdayChart from "./WeekdayChart";
import { Tab, TabList } from "./ui/Tabs";

type Mode = "winrate" | "battles";

interface Props {
	hourlyStats: HourlyStats | null;
	weeklyHeatmap: WeeklyHeatmapData | null;
	calendarData: CalendarStat | null;
}

export default function HeatmapGrid({ hourlyStats, weeklyHeatmap, calendarData }: Props) {
	const [mode, setMode] = useState<Mode>("battles");

	const hasAny = hourlyStats || weeklyHeatmap || calendarData;
	if (!hasAny) return null;

	return (
		<div className="flex flex-col gap-4">
			{/* Unified toggle */}
			<TabList>
				<Tab active={mode === "battles"} onClick={() => setMode("battles")}>
					Batalhas
				</Tab>
				<Tab active={mode === "winrate"} onClick={() => setMode("winrate")}>
					Win Rate
				</Tab>
			</TabList>

			{/* Two columns on desktop: left stacks 3 short panels, right has the tall weekly */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="flex flex-col gap-4">
					<HourlyHeatmap data={hourlyStats} mode={mode} />
					<CalendarHeatmap data={calendarData} mode={mode} />
					<WeekdayChart data={calendarData} mode={mode} />
				</div>
				<WeeklyHeatmap data={weeklyHeatmap} mode={mode} />
			</div>
		</div>
	);
}

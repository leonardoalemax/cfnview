"use client";

import CalendarHeatmap from "./CalendarHeatmap";
import CharacterRanks from "./CharacterRanks";
import HistoryList from "./HistoryList";
import HourlyHeatmap from "./HourlyHeatmap";
import LPChart from "./LPChart";
import OpponentChart from "./OpponentChart";
import WinLossChart from "./WinLossChart";
import type { CalendarStat, CharacterOption, CharacterRankStat, CharStat, HourlyStats, LPHistory, SF6Replay, WinLossStat } from "../lib/types";

const VALID_TABS = ["stats", "opponents", "history"] as const;
type Tab = (typeof VALID_TABS)[number];

interface Props {
	tab: Tab;
	userId: string;
	statsData: WinLossStat | null;
	opponentsData: CharStat[] | null;
	calendarData: CalendarStat | null;
	lpHistory: LPHistory | null;
	lpCharacters: CharacterOption[];
	defaultCharacter: string;
	characterRanks: CharacterRankStat[] | null;
	hourlyStats: HourlyStats | null;
	initialReplays: SF6Replay[];
	totalPages: number;
	historyCharacters: CharacterOption[];
}

export default function TabContent({
	tab,
	userId,
	statsData,
	opponentsData,
	calendarData,
	lpHistory,
	lpCharacters,
	defaultCharacter,
	characterRanks,
	hourlyStats,
	initialReplays,
	totalPages,
	historyCharacters,
}: Props) {
	if (tab === "stats") return (
		<div className="flex flex-col gap-4">
			<WinLossChart data={statsData} />
			<CharacterRanks data={characterRanks} />
			<LPChart
				userId={userId}
				defaultCharacter={defaultCharacter}
				initialData={lpHistory}
				initialCharacters={lpCharacters}
			/>
			<HourlyHeatmap data={hourlyStats} />
			<CalendarHeatmap data={calendarData} />
		</div>
	);
	if (tab === "opponents") return <OpponentChart data={opponentsData} />;
	return <HistoryList userId={userId} initialReplays={initialReplays} totalPages={totalPages} initialCharacters={historyCharacters} />;
}

import CharacterRanks from "./CharacterRanks";
import HeatmapGrid from "./HeatmapGrid";
import HistoryList from "./HistoryList";
import LPChart from "./LPChart";
import OpponentChart from "./OpponentChart";
import UserHeader from "./UserHeader";
import WinLossChart from "./WinLossChart";
import type { CalendarStat, CharacterOption, CharacterRankStat, CharStat, HourlyStats, LPHistory, SF6FighterBannerInfo, SF6Replay, WeeklyHeatmap as WeeklyHeatmapType, WinLossStat } from "../lib/types";

const VALID_TABS = ["stats", "opponents", "history"] as const;
type Tab = (typeof VALID_TABS)[number];

interface Props {
	tab: Tab;
	userId: string;
	bannerInfo: SF6FighterBannerInfo | null;
	statsData: WinLossStat | null;
	opponentsData: CharStat[] | null;
	calendarData: CalendarStat | null;
	lpHistory: LPHistory | null;
	lpCharacters: CharacterOption[];
	defaultCharacter: string;
	characterRanks: CharacterRankStat[] | null;
	hourlyStats: HourlyStats | null;
	weeklyHeatmap: WeeklyHeatmapType | null;
	initialReplays: SF6Replay[];
	totalPages: number;
	historyCharacters: CharacterOption[];
}

export default function TabContent({
	tab,
	userId,
	bannerInfo,
	statsData,
	opponentsData,
	calendarData,
	lpHistory,
	lpCharacters,
	defaultCharacter,
	characterRanks,
	hourlyStats,
	weeklyHeatmap,
	initialReplays,
	totalPages,
	historyCharacters,
}: Props) {
	if (tab === "stats") return (
		<div className="flex flex-col gap-4">
			{bannerInfo && <UserHeader info={bannerInfo} />}
			<WinLossChart data={statsData} />
			<CharacterRanks data={characterRanks} />
			<LPChart
				userId={userId}
				defaultCharacter={defaultCharacter}
				initialData={lpHistory}
				initialCharacters={lpCharacters}
			/>
			<HeatmapGrid
				hourlyStats={hourlyStats}
				weeklyHeatmap={weeklyHeatmap}
				calendarData={calendarData}
			/>
		</div>
	);
	if (tab === "opponents") return <OpponentChart data={opponentsData} userId={userId} characters={lpCharacters} />;
	return <HistoryList userId={userId} initialReplays={initialReplays} totalPages={totalPages} initialCharacters={historyCharacters} />;
}

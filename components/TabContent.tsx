import CharacterRanks from "./CharacterRanks";
import HeatmapGrid from "./HeatmapGrid";
import HistoryList from "./HistoryList";
import PlayerAnalysis from "./PlayerAnalysis";
import UserHeader from "./UserHeader";
import WinLossChart from "./WinLossChart";
import type { CalendarStat, CharacterOption, CharacterRankStat, CharStat, HourlyStats, LPHistory, SF6FighterBannerInfo, SF6Replay, WeeklyHeatmap as WeeklyHeatmapType, WinLossStat } from "../lib/types";

const VALID_TABS = ["stats", "history"] as const;
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
			{bannerInfo && <UserHeader info={bannerInfo} userId={userId} />}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<WinLossChart data={statsData} />
				<CharacterRanks data={characterRanks} userId={userId} />
			</div>
			<PlayerAnalysis
				userId={userId}
				defaultCharacter={defaultCharacter}
				initialLPData={lpHistory}
				initialCharacters={lpCharacters}
				initialOpponents={opponentsData}
			/>
			<HeatmapGrid
				hourlyStats={hourlyStats}
				weeklyHeatmap={weeklyHeatmap}
				calendarData={calendarData}
			/>
		</div>
	);
	return <HistoryList userId={userId} userName={bannerInfo?.personal_info?.fighter_id} initialReplays={initialReplays} totalPages={totalPages} initialCharacters={historyCharacters} />;
}

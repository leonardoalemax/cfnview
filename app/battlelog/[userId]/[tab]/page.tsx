import { notFound } from "next/navigation";
import PageLayout from "../../../../components/ui/PageLayout";
import TabContent from "../../../../components/TabContent";
import type {
	CalendarStat,
	CharacterOption,
	CharacterRankStat,
	CharStat,
	HourlyStats,
	LPHistory,
	ReplayPage,
	SF6Replay,
	SF6FighterBannerInfo,
	WeeklyHeatmap,
	WinLossStat,
} from "../../../../lib/types";

const VALID_TABS = ["stats", "opponents", "history"] as const;
type Tab = (typeof VALID_TABS)[number];

const BASE = process.env.GO_API_URL;
const NO_STORE = { cache: "no-store" } as const;

async function get<T>(path: string): Promise<T> {
	const res = await fetch(`${BASE}${path}`, NO_STORE);
	if (!res.ok) throw new Error(`${path} → ${res.status}`);
	return res.json();
}

interface Props {
	params: Promise<{ userId: string; tab: string }>;
}

export default async function BattlelogPage({ params }: Props) {
	const { userId, tab } = await params;

	if (!VALID_TABS.includes(tab as Tab)) return notFound();

	// opponents content is now merged into stats
	const currentTab = (tab === "opponents" ? "stats" : tab) as "stats" | "history";

	let bannerInfo: SF6FighterBannerInfo | null = null;
	let initialReplays: SF6Replay[] = [];
	let totalPages = 1;
	let statsData: WinLossStat | null = null;
	let opponentsData: CharStat[] | null = null;
	let calendarData: CalendarStat | null = null;
	let lpHistory: LPHistory | null = null;
	let hourlyStats: HourlyStats | null = null;
	let weeklyHeatmap: WeeklyHeatmap | null = null;
	let historyCharacters: CharacterOption[] = [];
	let lpCharacters: CharacterOption[] = [];
	let characterRanks: CharacterRankStat[] | null = null;
	let defaultCharacter = "";

	try {
		const isStats = currentTab === "stats";

		const tabFetch = isStats
			? get<WinLossStat>(`/v1/battlelog/${userId}/stats`)
			: get<ReplayPage>(
					`/v1/battlelog/${userId}/replays?page=1&limit=20`,
				);

		const [profile, tabData, hourlyData, calData, ranksData, charsData, weeklyData, oppData] =
			await Promise.all([
				get<SF6FighterBannerInfo>(`/v1/battlelog/${userId}/profile`),
				tabFetch,
				isStats
					? get<HourlyStats>(`/v1/battlelog/${userId}/hourly`)
					: Promise.resolve(null),
				isStats
					? get<CalendarStat>(`/v1/battlelog/${userId}/calendar`)
					: Promise.resolve(null),
				isStats
					? get<CharacterRankStat[]>(
							`/v1/battlelog/${userId}/character-ranks`,
						)
					: Promise.resolve(null),
				isStats
					? get<CharacterOption[]>(
							`/v1/battlelog/${userId}/characters`,
						)
					: Promise.resolve(null),
				isStats
					? get<WeeklyHeatmap>(`/v1/battlelog/${userId}/weekly`)
					: Promise.resolve(null),
				isStats
					? get<CharStat[]>(`/v1/battlelog/${userId}/opponents`)
					: Promise.resolve(null),
			]);

		bannerInfo = profile;

		if (currentTab === "history") {
			const page = tabData as ReplayPage;
			initialReplays = page.replays;
			totalPages = page.total_pages;
			try {
				historyCharacters = await get<CharacterOption[]>(
					`/v1/battlelog/${userId}/characters`,
				);
			} catch {
				// non-fatal
			}
		} else if (currentTab === "stats") {
			statsData = tabData as WinLossStat;
			hourlyStats = hourlyData as HourlyStats | null;
			weeklyHeatmap = weeklyData as WeeklyHeatmap | null;
			calendarData = calData as CalendarStat | null;
			characterRanks = ranksData as CharacterRankStat[] | null;
			opponentsData = oppData as CharStat[] | null;
			lpCharacters = (charsData as CharacterOption[] | null) ?? [];
			// default to character with highest LP (ranking)
			const topRank = characterRanks
				? [...characterRanks].sort((a, b) => b.lp - a.lp)[0]
				: null;
			defaultCharacter =
				topRank?.tool_name ??
				lpCharacters[0]?.tool_name ??
				"";
			if (defaultCharacter) {
				try {
					lpHistory = await get<LPHistory>(
						`/v1/battlelog/${userId}/lp-history?character=${defaultCharacter}`,
					);
				} catch {
					// non-fatal
				}
			}
		}
	} catch (err) {
		console.error("[page] fetch error:", err);
	}

	return (
		<PageLayout
			character={bannerInfo?.favorite_character_name?.toLowerCase()}>
			<TabContent
				tab={currentTab}
				userId={userId}
				bannerInfo={bannerInfo}
				initialReplays={initialReplays}
				totalPages={totalPages}
				statsData={statsData}
				opponentsData={opponentsData}
				calendarData={calendarData}
				lpHistory={lpHistory}
				hourlyStats={hourlyStats}
				weeklyHeatmap={weeklyHeatmap}
				historyCharacters={historyCharacters}
				lpCharacters={lpCharacters}
				defaultCharacter={defaultCharacter}
				characterRanks={characterRanks}
			/>
		</PageLayout>
	);
}

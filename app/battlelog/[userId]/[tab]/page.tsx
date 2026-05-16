import { notFound } from "next/navigation";
import UserHeader from "../../../../components/UserHeader";
import PageLayout from "../../../../components/ui/PageLayout";
import { Tab, TabList } from "../../../../components/ui/Tabs";
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
	WinLossStat,
} from "../../../../lib/types";

const VALID_TABS = ["stats", "opponents", "history"] as const;
type Tab = (typeof VALID_TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
	stats: "Stats",
	opponents: "Adversários",
	history: "Histórico",
};

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

	const currentTab = tab as Tab;

	let bannerInfo: SF6FighterBannerInfo | null = null;
	let initialReplays: SF6Replay[] = [];
	let totalPages = 1;
	let statsData: WinLossStat | null = null;
	let opponentsData: CharStat[] | null = null;
	let calendarData: CalendarStat | null = null;
	let lpHistory: LPHistory | null = null;
	let hourlyStats: HourlyStats | null = null;
	let historyCharacters: CharacterOption[] = [];
	let lpCharacters: CharacterOption[] = [];
	let characterRanks: CharacterRankStat[] | null = null;
	let defaultCharacter = "";

	try {
		const isStats = currentTab === "stats";

		const tabFetch =
			currentTab === "history"
				? get<ReplayPage>(`/v1/battlelog/${userId}/replays?page=1&limit=20`)
				: currentTab === "stats"
					? get<WinLossStat>(`/v1/battlelog/${userId}/stats`)
					: get<CharStat[]>(`/v1/battlelog/${userId}/opponents`);

		const [profile, tabData, hourlyData, calData, ranksData, charsData] =
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
					? get<CharacterOption[]>(`/v1/battlelog/${userId}/characters`)
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
			calendarData = calData as CalendarStat | null;
			characterRanks = ranksData as CharacterRankStat[] | null;
			lpCharacters = (charsData as CharacterOption[] | null) ?? [];
			// default to profile's favorite character, or first played character
			const profileChar = bannerInfo?.favorite_character_tool_name ?? "";
			defaultCharacter =
				lpCharacters.find((c) => c.tool_name === profileChar)?.tool_name ??
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
		} else {
			opponentsData = tabData as CharStat[];
		}
	} catch (err) {
		console.error("[page] fetch error:", err);
	}

	return (
		<PageLayout character={bannerInfo?.favorite_character_name?.toLowerCase()}>
			{bannerInfo && <UserHeader info={bannerInfo} />}

			<TabList scrollable className='mb-6'>
				{VALID_TABS.map((t) => (
					<Tab
						key={t}
						active={currentTab === t}
						href={`/battlelog/${userId}/${t}`}>
						{TAB_LABELS[t]}
					</Tab>
				))}
			</TabList>

			<TabContent
				tab={currentTab}
				userId={userId}
				initialReplays={initialReplays}
				totalPages={totalPages}
				statsData={statsData}
				opponentsData={opponentsData}
				calendarData={calendarData}
				lpHistory={lpHistory}
				hourlyStats={hourlyStats}
				historyCharacters={historyCharacters}
				lpCharacters={lpCharacters}
				defaultCharacter={defaultCharacter}
				characterRanks={characterRanks}
			/>
		</PageLayout>
	);
}

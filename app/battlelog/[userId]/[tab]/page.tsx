import { notFound } from "next/navigation";
import Link from "next/link";
import UserHeader from "../../../../components/UserHeader";
import AppNavbar from "../../../../components/ui/AppNavbar";
import PageLayout from "../../../../components/ui/PageLayout";
import TabContent from "../../../../components/TabContent";
import type {
	CalendarStat,
	CharacterOption,
	CharacterRankStat,
	CharStat,
	FightingSnapshot,
	HourlyStats,
	LPHistory,
	ReplayPage,
	SF6Replay,
	SF6FighterBannerInfo,
	UsageSnapshot,
	WinLossStat,
} from "../../../../lib/types";

const VALID_TABS = ["stats", "opponents", "history", "usage", "fighting"] as const;
type Tab = (typeof VALID_TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
	stats: "Stats",
	opponents: "Adversários",
	history: "Histórico",
	usage: "Uso de Boneco",
	fighting: "Matchups",
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
	let usageMonths: string[] = [];
	let usageInitialData: UsageSnapshot | null = null;
	let fightingMonths: string[] = [];
	let fightingInitialData: FightingSnapshot | null = null;
	let historyCharacters: CharacterOption[] = [];
	let lpCharacters: CharacterOption[] = [];
	let characterRanks: CharacterRankStat[] | null = null;
	let defaultCharacter = "";

	try {
		const isStats = currentTab === "stats";
		const isUsage = currentTab === "usage";
		const isFighting = currentTab === "fighting";

		const tabFetch = isUsage
			? get<string[]>("/v1/usage/months")
			: isFighting
				? get<string[]>("/v1/fighting/months")
				: currentTab === "history"
				? get<ReplayPage>(`/v1/battlelog/${userId}/replays?page=1&limit=20`)
				: currentTab === "stats"
					? get<WinLossStat>(`/v1/battlelog/${userId}/stats`)
					: get<CharStat[]>(`/v1/battlelog/${userId}/opponents`);

		const [profile, tabData, hourlyData, calData, ranksData, charsData] = await Promise.all([
			get<SF6FighterBannerInfo>(`/v1/battlelog/${userId}/profile`),
			tabFetch,
			isStats ? get<HourlyStats>(`/v1/battlelog/${userId}/hourly`) : Promise.resolve(null),
			isStats ? get<CalendarStat>(`/v1/battlelog/${userId}/calendar`) : Promise.resolve(null),
			isStats ? get<CharacterRankStat[]>(`/v1/battlelog/${userId}/character-ranks`) : Promise.resolve(null),
			isStats ? get<CharacterOption[]>(`/v1/battlelog/${userId}/characters`) : Promise.resolve(null),
		]);

		bannerInfo = profile;

		if (isUsage) {
			usageMonths = tabData as string[];
			if (usageMonths.length > 0) {
				try {
					usageInitialData = await get<UsageSnapshot>(`/v1/usage/${usageMonths[0]}`);
				} catch {
					// non-fatal — client will retry
				}
			}
		} else if (isFighting) {
			fightingMonths = tabData as string[];
			if (fightingMonths.length > 0) {
				try {
					fightingInitialData = await get<FightingSnapshot>(`/v1/fighting/${fightingMonths[0]}`);
				} catch {
					// non-fatal — client will retry
				}
			}
		} else if (currentTab === "history") {
			const page = tabData as ReplayPage;
			initialReplays = page.replays;
			totalPages = page.total_pages;
			try {
				historyCharacters = await get<CharacterOption[]>(`/v1/battlelog/${userId}/characters`);
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
			defaultCharacter = lpCharacters.find((c) => c.tool_name === profileChar)?.tool_name
				?? lpCharacters[0]?.tool_name
				?? "";
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
			<AppNavbar title='cfnview' />

			{bannerInfo && <UserHeader info={bannerInfo} />}

			<div className='overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6'>
				<div
					role='tablist'
					className='tabs tabs-box flex-nowrap min-w-max sm:min-w-0'>
					{VALID_TABS.map((t) => (
						<Link
							key={t}
							href={`/battlelog/${userId}/${t}`}
							role='tab'
							className={`tab ${currentTab === t ? "tab-active" : ""}`}>
							{TAB_LABELS[t]}
						</Link>
					))}
				</div>
			</div>

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
				usageMonths={usageMonths}
				usageInitialData={usageInitialData}
				fightingMonths={fightingMonths}
				fightingInitialData={fightingInitialData}
				historyCharacters={historyCharacters}
				lpCharacters={lpCharacters}
				defaultCharacter={defaultCharacter}
				characterRanks={characterRanks}
			/>
		</PageLayout>
	);
}

import { notFound } from "next/navigation";
import Link from "next/link";
import UserHeader from "../../../../components/UserHeader";
import AppNavbar from "../../../../components/ui/AppNavbar";
import PageLayout from "../../../../components/ui/PageLayout";
import TabContent from "../../../../components/TabContent";
import type { CachedBattlelog } from "../../../../lib/types";

const VALID_TABS = ["stats", "opponents", "history", "calendar"] as const;
type Tab = (typeof VALID_TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
	stats: "Stats",
	opponents: "Adversários",
	history: "Histórico",
	calendar: "Calendário",
};

async function getBattlelog(userId: string): Promise<CachedBattlelog> {
	const url = `${process.env.GO_API_URL}/v1/battlelog/${userId}`;
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) throw new Error(`Go API returned ${res.status}`);
	return res.json();
}

interface Props {
	params: Promise<{ userId: string; tab: string }>;
}

export default async function BattlelogPage({ params }: Props) {
	const { userId, tab } = await params;

	if (!VALID_TABS.includes(tab as Tab)) return notFound();

	let data: CachedBattlelog = { replays: [], cachedAt: 0 };
	try {
		data = await getBattlelog(userId);
	} catch (err) {
		console.error("[page] getBattlelog error:", err);
	}

	const { replays, cachedAt, bannerInfo } = data;
	const currentTab = tab as Tab;

	const cacheLabel = cachedAt
		? `Atualizado em ${new Date(cachedAt).toLocaleString("pt-BR")}`
		: undefined;

	return (
		<PageLayout>
			<AppNavbar title="cfnview" subtitle={cacheLabel} />

			{bannerInfo && <UserHeader info={bannerInfo} />}

			<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
				<div role="tablist" className="tabs tabs-box flex-nowrap min-w-max sm:min-w-0">
					{VALID_TABS.map((t) => (
						<Link
							key={t}
							href={`/battlelog/${userId}/${t}`}
							role="tab"
							className={`tab ${currentTab === t ? "tab-active" : ""}`}
						>
							{TAB_LABELS[t]}
						</Link>
					))}
				</div>
			</div>

			<TabContent tab={currentTab} userId={userId} replays={replays} />
		</PageLayout>
	);
}

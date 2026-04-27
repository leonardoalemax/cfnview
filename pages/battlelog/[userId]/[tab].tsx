import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import BattleCard from "../../../components/BattleCard";
import CalendarHeatmap from "../../../components/CalendarHeatmap";
import UserHeader from "../../../components/UserHeader";
import AppNavbar from "../../../components/ui/AppNavbar";
import PageLayout from "../../../components/ui/PageLayout";
import StatCard from "../../../components/ui/StatCard";
import { getBattlelog } from "../../../lib/battlelog-server";
import type { CachedBattlelog } from "../../../lib/types";

const VALID_TABS = ["stats", "opponents", "history", "calendar"] as const;
type Tab = (typeof VALID_TABS)[number];

const WinLossChart = dynamic(() => import("../../../components/WinLossChart"), {
	ssr: false,
	loading: () => (
		<StatCard className="mb-6">
			<div className="skeleton h-48 w-full rounded-box" />
		</StatCard>
	),
});
const OpponentChart = dynamic(() => import("../../../components/OpponentChart"), {
	ssr: false,
	loading: () => (
		<StatCard>
			<div className="skeleton h-64 w-full rounded-box" />
		</StatCard>
	),
});

interface Props extends CachedBattlelog {
	userId: string;
	tab: Tab;
}

const TAB_LABELS: Record<Tab, string> = {
	stats: "Stats",
	opponents: "Adversários",
	history: "Histórico",
	calendar: "Calendário",
};

function TabContent({ tab, userId, replays }: Props) {
	if (tab === "stats") return <WinLossChart replays={replays} userId={userId} />;
	if (tab === "opponents") return <OpponentChart replays={replays} userId={userId} />;
	if (tab === "calendar") return <CalendarHeatmap replays={replays} userId={userId} />;
	return (
		<ul className="flex flex-col gap-3">
			{replays.map((replay) => (
				<li key={replay.replay_id}>
					<BattleCard replay={replay} />
				</li>
			))}
		</ul>
	);
}

export default function BattlelogPage(props: Props) {
	const { userId, tab, cachedAt, bannerInfo } = props;

	const cacheLabel = cachedAt
		? `Atualizado em ${new Date(cachedAt).toLocaleString("pt-BR")}`
		: undefined;

	return (
		<PageLayout>
			<AppNavbar title="cfnview" subtitle={cacheLabel} />

			{bannerInfo && <UserHeader info={bannerInfo} />}

			{/* Tabs — scrollable on mobile */}
			<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
				<div role="tablist" className="tabs tabs-box flex-nowrap min-w-max sm:min-w-0">
					{VALID_TABS.map((t) => (
						<Link
							key={t}
							href={`/battlelog/${userId}/${t}`}
							role="tab"
							className={`tab ${tab === t ? "tab-active" : ""}`}
						>
							{TAB_LABELS[t]}
						</Link>
					))}
				</div>
			</div>

			<TabContent {...props} />
		</PageLayout>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
	const userId = String(params?.userId ?? "");
	const tab = String(params?.tab ?? "") as Tab;

	if (!VALID_TABS.includes(tab)) return { notFound: true };

	try {
		const data = await getBattlelog(userId);
		return { props: { ...data, userId, tab } };
	} catch {
		return {
			props: { userId, tab, replays: [], cachedAt: null as unknown as number },
		};
	}
};

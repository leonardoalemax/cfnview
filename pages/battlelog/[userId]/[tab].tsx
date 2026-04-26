import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import BattleCard from "../../../components/BattleCard";
import CalendarHeatmap from "../../../components/CalendarHeatmap";
import UserHeader from "../../../components/UserHeader";
import { getBattlelog } from "../../../lib/battlelog-server";
import type { CachedBattlelog } from "../../../lib/types";

const VALID_TABS = ["stats", "opponents", "history", "calendar"] as const;
type Tab = (typeof VALID_TABS)[number];

const WinLossChart = dynamic(() => import("../../../components/WinLossChart"), {
	ssr: false,
	loading: () => <div className='skeleton h-48 w-full' />,
});
const OpponentChart = dynamic(() => import("../../../components/OpponentChart"), {
	ssr: false,
	loading: () => <div className='skeleton h-64 w-full' />,
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
		<ul className='flex flex-col gap-3'>
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
	const router = useRouter();

	const cacheLabel = cachedAt ? new Date(cachedAt).toLocaleString("pt-BR") : null;

	function handleResync() {
		router.replace(`/battlelog/${userId}/${tab}?resync=true`);
	}

	return (
		<main className='min-h-screen p-6'>
			<div className='max-w-3xl mx-auto'>
				{/* App bar */}
				<div className='flex items-center justify-between mb-4'>
					<div>
						<h1 className='text-2xl font-bold'>cfnview</h1>
						{cacheLabel && (
							<p className='text-xs text-base-content/40 mt-0.5'>
								Atualizado em {cacheLabel}
							</p>
						)}
					</div>
					<button className='btn btn-outline btn-sm' onClick={handleResync}>
						Resync
					</button>
				</div>

				{/* User profile header */}
				{bannerInfo && <UserHeader info={bannerInfo} />}

				{/* Tabs */}
				<div role='tablist' className='tabs tabs-bordered mb-6'>
					{VALID_TABS.map((t) => (
						<Link
							key={t}
							href={`/battlelog/${userId}/${t}`}
							role='tab'
							className={`tab ${tab === t ? "tab-active" : ""}`}
						>
							{TAB_LABELS[t]}
						</Link>
					))}
				</div>

				{/* Content */}
				<TabContent {...props} />
			</div>
		</main>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
	const userId = String(params?.userId ?? "");
	const tab = String(params?.tab ?? "") as Tab;

	if (!VALID_TABS.includes(tab)) return { notFound: true };

	const resync = query.resync === "true";

	try {
		const data = await getBattlelog(userId, resync);

		if (resync) {
			return {
				redirect: { destination: `/battlelog/${userId}/${tab}`, permanent: false },
			};
		}

		return { props: { ...data, userId, tab } };
	} catch {
		return {
			props: { userId, tab, replays: [], cachedAt: null as unknown as number },
		};
	}
};

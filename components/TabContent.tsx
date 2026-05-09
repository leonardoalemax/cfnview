"use client";

import dynamic from "next/dynamic";
import BattleCard from "./BattleCard";
import CalendarHeatmap from "./CalendarHeatmap";
import StatCard from "./ui/StatCard";
import type { SF6Replay } from "../lib/types";

const VALID_TABS = ["stats", "opponents", "history", "calendar"] as const;
type Tab = (typeof VALID_TABS)[number];

const WinLossChart = dynamic(() => import("./WinLossChart"), {
	ssr: false,
	loading: () => (
		<StatCard className="mb-6">
			<div className="skeleton h-48 w-full rounded-box" />
		</StatCard>
	),
});

const OpponentChart = dynamic(() => import("./OpponentChart"), {
	ssr: false,
	loading: () => (
		<StatCard>
			<div className="skeleton h-64 w-full rounded-box" />
		</StatCard>
	),
});

interface Props {
	tab: Tab;
	userId: string;
	replays: SF6Replay[];
}

export default function TabContent({ tab, userId, replays }: Props) {
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

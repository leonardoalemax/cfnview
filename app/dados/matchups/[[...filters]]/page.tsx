import { redirect } from "next/navigation";
import FightingTable from "../../../../components/FightingTable";
import type { FightingSnapshot } from "../../../../lib/types";

const BASE = process.env.GO_API_URL;
const NO_STORE = { cache: "no-store" } as const;

async function get<T>(path: string): Promise<T> {
	const res = await fetch(`${BASE}${path}`, NO_STORE);
	if (!res.ok) throw new Error(`${path} → ${res.status}`);
	return res.json();
}

interface Props {
	params: Promise<{ filters?: string[] }>;
}

export default async function MatchupsPage({ params }: Props) {
	const { filters } = await params;

	let months: string[] = [];
	try {
		months = await get<string[]>("/v1/fighting/months");
	} catch (err) {
		console.error("[matchups] months error:", err);
	}

	if (months.length === 0) {
		return <FightingTable months={[]} initialData={null} month="" type="0" league="" />;
	}

	// Sem filtros → redireciona para a URL completa com defaults
	if (!filters || filters.length < 3) {
		redirect(`/dados/matchups/${months[0]}/0/all`);
	}

	const [month, type, league] = filters;
	const leagueParam = league === "all" ? "" : decodeURIComponent(league);

	let data: FightingSnapshot | null = null;
	try {
		data = await get<FightingSnapshot>(`/v1/fighting/${month}`);
	} catch (err) {
		console.error("[matchups] data error:", err);
	}

	return (
		<FightingTable
			months={months}
			initialData={data}
			month={month}
			type={type}
			league={leagueParam}
		/>
	);
}

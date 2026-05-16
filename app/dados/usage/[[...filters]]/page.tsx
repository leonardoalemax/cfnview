import { redirect } from "next/navigation";
import UsageChart from "../../../../components/UsageChart";
import type { UsageSnapshot } from "../../../../lib/types";

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

export default async function UsagePage({ params }: Props) {
	const { filters } = await params;

	let months: string[] = [];
	try {
		months = await get<string[]>("/v1/usage/months");
	} catch (err) {
		console.error("[usage] months error:", err);
	}

	if (months.length === 0) {
		return <UsageChart months={[]} initialData={null} month="" type="0" league="" />;
	}

	// Sem filtros → redireciona para a URL completa com defaults
	if (!filters || filters.length < 3) {
		redirect(`/dados/usage/${months[0]}/0/all`);
	}

	const [month, type, league] = filters;
	// decodeURIComponent é idempotente pra strings já decodificadas,
	// então é seguro chamar mesmo que o Next.js já tenha decodificado.
	const leagueParam = league === "all" ? "" : decodeURIComponent(league);

	let data: UsageSnapshot | null = null;
	try {
		data = await get<UsageSnapshot>(`/v1/usage/${month}`);
	} catch (err) {
		console.error("[usage] data error:", err);
	}

	return (
		<UsageChart
			months={months}
			initialData={data}
			month={month}
			type={type}
			league={leagueParam}
		/>
	);
}

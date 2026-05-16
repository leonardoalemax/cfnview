import StatCard from "../../../components/ui/StatCard";
import SectionTitle from "../../../components/ui/SectionTitle";
import WorldMap from "../../../components/WorldMap";
import type { CountryPlayerCount } from "../../../lib/types";

const BASE = process.env.GO_API_URL;
const NO_STORE = { cache: "no-store" } as const;

async function get<T>(path: string): Promise<T> {
	const res = await fetch(`${BASE}${path}`, NO_STORE);
	if (!res.ok) throw new Error(`${path} → ${res.status}`);
	return res.json();
}

export default async function MapPage() {
	let data: CountryPlayerCount[] = [];
	try {
		data = await get<CountryPlayerCount[]>("/v1/ranking/league_point/players-by-country");
	} catch (err) {
		console.error("[dados/map] fetch error:", err);
	}

	const total = data.reduce((acc, c) => acc + c.player_count, 0);
	const countries = data.length;

	return (
		<StatCard>
			<SectionTitle>Jogadores por país</SectionTitle>

			<div className="flex gap-4 text-xs text-base-content/60 mb-2">
				<span><strong className="text-base-content">{total.toLocaleString("pt-BR")}</strong> jogadores no total</span>
				<span><strong className="text-base-content">{countries}</strong> países</span>
			</div>

			{data.length === 0 ? (
				<p className="text-sm text-base-content/40 text-center py-8">
					Sem dados. Rode o sync do ranking primeiro.
				</p>
			) : (
				<WorldMap data={data} />
			)}
		</StatCard>
	);
}

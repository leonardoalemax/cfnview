import type { CharacterRankStat } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function characterFace(toolName: string): string {
	return `${SF6_BASE}/praise/fighter/${toolName}/face1.png`;
}

function rankImg(rank: number): string {
	return `${SF6_BASE}/material/rank/rank${rank}_s.png`;
}

interface Props {
	data: CharacterRankStat[] | null;
}

export default function CharacterRanks({ data }: Props) {
	if (!data || data.length === 0) return null;

	return (
		<StatCard>
			<SectionTitle>Ranking por Personagem</SectionTitle>
			<div className="flex flex-col divide-y divide-base-content/10">
				{data.map((c) => (
					<div key={c.tool_name} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
						<img
							src={characterFace(c.tool_name)}
							alt={c.name}
							className="w-10 h-10 rounded-full object-cover shrink-0"
						/>
						<span className="flex-1 text-sm font-medium">{c.name}</span>
						<div className="flex items-center gap-2">
							{c.league_rank > 0 && (
								<img
									src={rankImg(c.league_rank)}
									alt={`rank ${c.league_rank}`}
									className="h-7 w-auto"
								/>
							)}
							<span className="text-sm font-bold tabular-nums text-primary">
								{c.lp.toLocaleString()} LP
							</span>
						</div>
					</div>
				))}
			</div>
		</StatCard>
	);
}

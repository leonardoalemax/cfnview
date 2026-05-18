import Link from "next/link";
import type { CharacterRankStat } from "../lib/types";
import { rankImg } from "../lib/types";
import CharacterIcon from "./ui/CharacterIcon";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";

interface Props {
	data: CharacterRankStat[] | null;
	userId: string;
}

export default function CharacterRanks({ data, userId }: Props) {
	if (!data || data.length === 0) return null;

	return (
		<StatCard>
			<SectionTitle>Ranking por Personagem</SectionTitle>
			<div className="flex flex-col divide-y divide-base-content/10">
				{data.map((c) => (
					<div key={c.tool_name} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
						<CharacterIcon toolName={c.tool_name} className="w-10 h-10" />
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
							<Link
								href={`/battlelog/${userId}/history?character=${c.tool_name}`}
								className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-primary"
								title={`Histórico de ${c.name}`}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
									<polyline points="12 8 12 12 14 14" />
									<circle cx="12" cy="12" r="10" />
								</svg>
							</Link>
						</div>
					</div>
				))}
			</div>
		</StatCard>
	);
}

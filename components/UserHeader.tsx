import Image from "next/image";
import { characterImg, platformImg, rankImg } from "../lib/types";
import type { SF6FighterBannerInfo } from "../lib/types";
import StatCard from "./ui/StatCard";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function titleImg(plateName: string) {
	return `${SF6_BASE}/material/title_s/${plateName}.png`;
}

export default function UserHeader({ info }: { info: SF6FighterBannerInfo }) {
	const { personal_info, favorite_character_league_info: league } = info;
	const playPoint = info.favorite_character_play_point;
	const totalPP = playPoint.fighting_ground + playPoint.world_tour + playPoint.battle_hub;
	const fgPct = totalPP > 0 ? Math.round((playPoint.fighting_ground / totalPP) * 100) : 0;
	const wtPct = totalPP > 0 ? Math.round((playPoint.world_tour / totalPP) * 100) : 0;
	const bhPct = totalPP > 0 ? Math.round((playPoint.battle_hub / totalPP) * 100) : 0;

	return (
		<StatCard className="mb-6" bodyClassName="gap-3">
			<div className="flex flex-col sm:flex-row gap-4 items-start">
				{/* Character art */}
				<div className="relative w-24 h-24 shrink-0 mx-auto sm:mx-0">
					<Image
						src={characterImg(info.favorite_character_tool_name, "l")}
						alt={info.favorite_character_name}
						fill
						className="object-contain"
						unoptimized
					/>
				</div>

				{/* Info block */}
				<div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
					{/* Player name + platform */}
					<div className="flex items-center gap-2">
						<span className="relative w-4 h-4 shrink-0">
							<Image
								src={platformImg(personal_info.platform_tool_name)}
								alt={personal_info.platform_name}
								fill
								className="object-contain"
								unoptimized
							/>
						</span>
						<span className="font-bold text-lg leading-none">{personal_info.fighter_id}</span>
					</div>

					{/* Selected character + rank row */}
					<div className="flex flex-wrap gap-4">
						{/* Character */}
						<div>
							<p className="text-xs text-base-content/50 mb-0.5">Selected Character</p>
							<p className="font-bold tracking-wider">{info.favorite_character_alpha}</p>
						</div>

						{/* League */}
						<div>
							<p className="text-xs text-base-content/50 mb-0.5">League Points</p>
							<div className="flex items-center gap-1.5">
								<span className="relative w-10 h-5">
									<Image
										src={rankImg(league.league_rank)}
										alt={league.league_rank_info.league_rank_name}
										fill
										className="object-contain"
										unoptimized
									/>
								</span>
								<span className="font-bold">{league.league_point.toLocaleString("pt-BR")} LP</span>
								<span className="text-xs text-base-content/50">
									({league.league_rank_info.league_rank_name})
								</span>
							</div>
						</div>

						{/* Kudos */}
						<div className="flex-1 min-w-[160px]">
							<p className="text-xs text-base-content/50 mb-0.5">Kudos</p>
							<p className="font-bold mb-1">{totalPP.toLocaleString("pt-BR")}</p>
							<div className="flex h-3 rounded overflow-hidden w-full text-[9px] font-bold">
								{fgPct > 0 && (
									<div
										className="bg-primary flex items-center justify-center text-primary-content overflow-hidden"
										style={{ width: `${fgPct}%` }}
										title={`Fighting Ground ${fgPct}%`}
									>
										{fgPct >= 10 && "FG"}
									</div>
								)}
								{wtPct > 0 && (
									<div
										className="bg-secondary flex items-center justify-center text-secondary-content overflow-hidden"
										style={{ width: `${wtPct}%` }}
										title={`World Tour ${wtPct}%`}
									>
										{wtPct >= 10 && "WT"}
									</div>
								)}
								{bhPct > 0 && (
									<div
										className="bg-accent flex items-center justify-center text-accent-content overflow-hidden"
										style={{ width: `${bhPct}%` }}
										title={`Battle Hub ${bhPct}%`}
									>
										{bhPct >= 10 && "BH"}
									</div>
								)}
							</div>
							<div className="flex gap-2 mt-0.5 text-[10px] text-base-content/50">
								<span>FG {playPoint.fighting_ground.toLocaleString("pt-BR")}</span>
								{playPoint.world_tour > 0 && <span>WT {playPoint.world_tour.toLocaleString("pt-BR")}</span>}
								<span>BH {playPoint.battle_hub.toLocaleString("pt-BR")}</span>
							</div>
						</div>
					</div>

					{/* Title */}
					<div className="flex items-center gap-2">
						<div className="relative h-5 w-36">
							<Image
								src={titleImg(info.title_data.title_data_plate_name)}
								alt={info.title_data.title_data_val}
								fill
								className="object-contain object-left"
								unoptimized
							/>
						</div>
						<span className="text-xs text-base-content/60">{info.title_data.title_data_val}</span>
					</div>
				</div>
			</div>
		</StatCard>
	);
}

import Image from "next/image";
import { characterImg, platformImg, rankImg } from "../lib/types";
import type { SF6FighterBannerInfo } from "../lib/types";
import StatCard from "./ui/StatCard";
import KudosPie from "./KudosPie";
import SelectedCharacterBanner from "./ui/SelectedCharacterBanner";

export default function UserHeader({ info }: { info: SF6FighterBannerInfo }) {
	const { personal_info, favorite_character_league_info: league } = info;
	const playPoint = info.favorite_character_play_point;

	return (
		<>
			<div className='sf6-panel py-2 gap-4 px-4 mb-4 flex min-[320px]:flex-row flex-col '>
				<div className='flex items-center w-full gap-2'>
					<span className='relative w-4 h-4 shrink-0'>
						<Image
							src={platformImg(personal_info.platform_tool_name)}
							alt={personal_info.platform_name}
							fill
							className='object-contain'
							unoptimized
						/>
					</span>
					<span className='font-bold text-lg leading-none'>
						{personal_info.fighter_id}
					</span>
				</div>

				<KudosPie
					fightingGround={playPoint.fighting_ground}
					worldTour={playPoint.world_tour}
					battleHub={playPoint.battle_hub}
				/>
			</div>

			<div className='sf6-panel py-2 gap-4 px-2 mb-4 flex flex-col'>
				<h2>Ultimo boneco usado</h2>
				<div className='flex flex-row gap-4'>
					<div className='flex flex-col sm:flex-row gap-4 items-start'>
						<div className='sf6-panel relative sm:w-24 sm:h-24 w-16 h-16 shrink-0 mx-auto sm:mx-0'>
							<Image
								src={characterImg(
									info.favorite_character_tool_name,
									"l",
								)}
								alt={info.favorite_character_name}
								fill
								className='object-contain'
								unoptimized
							/>
						</div>
					</div>
					<div className='flex flex-col min-h-full w-full gap-4 justify-between items-start'>
						<p className='font-bold sm:text-xl text-sm tracking-wider'>
							{info.favorite_character_alpha}
						</p>
						<SelectedCharacterBanner
							plateName={info.title_data.title_data_plate_name}
							value={info.title_data.title_data_val}
						/>
					</div>
					<div className='flex flex-col min-w-24'>
						<div className='relative h-10 sm:h-16'>
							<Image
								src={rankImg(league.league_rank)}
								alt={league.league_rank_info.league_rank_name}
								fill
								className='object-contain'
								unoptimized
							/>
						</div>
						<span className='font-bold text-center'>
							{league.league_point.toLocaleString("pt-BR")} LP
						</span>
					</div>
				</div>
			</div>
		</>
	);
}

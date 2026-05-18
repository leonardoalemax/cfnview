import Image from "next/image";
import Link from "next/link";
import { platformImg, rankImg } from "../lib/types";
import CharacterIcon from "./ui/CharacterIcon";
import type { SF6FighterBannerInfo } from "../lib/types";
import StatCard from "./ui/StatCard";
import KudosPie from "./KudosPie";
import SelectedCharacterBanner from "./ui/SelectedCharacterBanner";

export default function UserHeader({ info, userId }: { info: SF6FighterBannerInfo; userId: string }) {
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

				<Link
					href={`/battlelog/${userId}/history`}
					className='btn btn-sm btn-ghost gap-1 text-xs text-base-content/60 shrink-0'>
					<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' className='w-4 h-4'>
						<polyline points='12 8 12 12 14 14' />
						<circle cx='12' cy='12' r='10' />
					</svg>
					Histórico
				</Link>

				<KudosPie
					fightingGround={playPoint.fighting_ground}
					worldTour={playPoint.world_tour}
					battleHub={playPoint.battle_hub}
				/>
			</div>
		</>
	);
}

import Image from "next/image";
import { characterImg, rankImg, type CachedBattlelog } from "../../lib/types";

interface Props {
	data: CachedBattlelog;
}

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function profileBg(toolName: string) {
	return `${SF6_BASE}/material/character/profile_${toolName}.png`;
}

export default function OverlayPlayerCard({ data }: Props) {
	const info = data.bannerInfo;
	if (!info) return null;

	const league = info.favorite_character_league_info;
	const pp = info.favorite_character_play_point;
	const totalPP = pp.fighting_ground + pp.world_tour + pp.battle_hub;
	const fgPct =
		totalPP > 0 ? Math.round((pp.fighting_ground / totalPP) * 100) : 0;
	const wtPct = totalPP > 0 ? Math.round((pp.world_tour / totalPP) * 100) : 0;
	const bhPct = totalPP > 0 ? Math.round((pp.battle_hub / totalPP) * 100) : 0;

	return (
		<div
			className='relative w-full h-full overflow-hidden justify-between flex flex-col p-2'
			style={{ height: 380, maxHeight: 380, overflow: "hidden" }}>
			<div
				className='absolute right-0 bottom-0 pointer-events-none select-none'
				style={{ width: "100%", height: "100%", opacity: 0.35 }}>
				<Image
					src={profileBg(info.favorite_character_tool_name)}
					alt=''
					fill
					className='object-contain object-bottom'
					unoptimized
				/>
			</div>

			{/* Fighter name + character */}
			<div className='flex flex-col gap-1 z-10'>
				<span
					className='font-black text-white leading-tight truncate'
					style={{ fontSize: 46, textAlign: "right" }}>
					{info.personal_info.fighter_id}
				</span>
				<span
					className='text-white/50 truncate'
					style={{ fontSize: 24, textAlign: "right" }}>
					{info.favorite_character_alpha}
				</span>
			</div>

			{/* Rank badge + LP */}
			<div className='flex flex-col items-center gap-2 z-10'>
				<Image
					src={rankImg(league.league_rank)}
					alt={league.league_rank_info.league_rank_name}
					width={128}
					height={64}
					className='object-contain'
					unoptimized
				/>
				<span
					className='text-white font-black leading-none'
					style={{ fontSize: 60 }}>
					{league.league_point.toLocaleString("pt-BR")}
					<span
						className='text-white/40 font-normal'
						style={{ fontSize: 30 }}>
						{" "}
						LP
					</span>
				</span>
			</div>

			{/* Kudos bar */}
			<div className='z-10 flex flex-col gap-2'>
				<div className='flex items-center justify-between'>
					<span
						className='text-white/40 uppercase tracking-wider'
						style={{ fontSize: 16 }}>
						Kudos
					</span>
					<span
						className='text-white/60 font-semibold'
						style={{ fontSize: 16 }}>
						{totalPP.toLocaleString("pt-BR")}
					</span>
				</div>
				<div
					className='flex rounded-full overflow-hidden w-full'
					style={{ height: 10 }}>
					{fgPct > 0 && (
						<div
							className='bg-primary'
							style={{ width: `${fgPct}%` }}
						/>
					)}
					{wtPct > 0 && (
						<div
							className='bg-secondary'
							style={{ width: `${wtPct}%` }}
						/>
					)}
					{bhPct > 0 && (
						<div
							className='bg-accent'
							style={{ width: `${bhPct}%` }}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

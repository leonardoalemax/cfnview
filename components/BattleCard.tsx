import Image from "next/image";
import {
	SF6Replay,
	SF6PlayerInfo,
	characterImg,
	controlImg,
	getWinner,
	platformImg,
	rankImg,
	VS_IMG,
} from "../lib/types";

function PlayerSide({
	info,
	side,
	isWinner,
}: {
	info: SF6PlayerInfo;
	side: "left" | "right";
	isWinner: boolean;
}) {
	const charSide = side === "left" ? "l" : "r";

	const stats = (
		<ul className={`flex items-center gap-1.5 ${side === "right" ? "flex-row-reverse" : ""}`}>
			<li className='relative w-5 h-5 shrink-0'>
				<Image
					src={controlImg(info.battle_input_type)}
					alt=''
					fill
					className='object-contain'
					unoptimized
				/>
			</li>
			<li className='relative w-10 h-5 shrink-0'>
				<Image
					src={rankImg(info.league_rank)}
					alt={`rank ${info.league_rank}`}
					fill
					className='object-contain'
					unoptimized
				/>
			</li>
			<li className='text-xs font-bold whitespace-nowrap'>
				{info.league_point.toLocaleString()} LP
			</li>
		</ul>
	);

	const charArt = (
		<div className='relative w-28 h-28 shrink-0'>
			<Image
				src={characterImg(info.playing_character_tool_name, charSide)}
				alt={info.playing_character_name}
				fill
				className='object-contain'
				unoptimized
			/>
		</div>
	);

	return (
		<div
			className={`flex flex-col items-center gap-1 flex-1 transition-opacity ${isWinner ? "opacity-100" : "opacity-40"}`}
		>
			{side === "left" ? charArt : null}
			{stats}
			{side === "right" ? charArt : null}
		</div>
	);
}

function PlayerName({
	info,
	align,
}: {
	info: SF6PlayerInfo;
	align: "left" | "right";
}) {
	return (
		<p
			className={`flex items-center gap-1 text-sm font-semibold min-w-0 ${align === "right" ? "flex-row-reverse" : ""}`}
		>
			<span className='relative w-4 h-4 shrink-0 inline-block'>
				<Image
					src={platformImg(info.player.platform_tool_name)}
					alt={info.player.platform_name}
					fill
					className='object-contain'
					unoptimized
				/>
			</span>
			<span className='truncate'>{info.player.fighter_id}</span>
		</p>
	);
}

export default function BattleCard({ replay }: { replay: SF6Replay }) {
	const winner = getWinner(replay);
	const p1wins = winner === 1;
	const p2wins = winner === 2;

	const date = new Date(replay.uploaded_at * 1000).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className='card bg-base-200 shadow border border-base-300'>
			<div className='card-body p-3 gap-2'>
				{/* Names + date */}
				<div className='flex items-center justify-between gap-2'>
					<PlayerName info={replay.player1_info} align='left' />
					<span className='text-xs text-base-content/40 shrink-0'>{date}</span>
					<PlayerName info={replay.player2_info} align='right' />
				</div>

				{/* Battle row */}
				<div className='flex items-center gap-2'>
					<PlayerSide info={replay.player1_info} side='left' isWinner={p1wins} />

					{/* Center */}
					<div className='flex flex-col items-center gap-1 w-20 shrink-0'>
						<span className={`text-xs font-bold ${p1wins ? "text-success" : "text-error"}`}>
							{p1wins ? "WINS" : "LOSES"}
						</span>
						<div className='relative w-10 h-6'>
							<Image src={VS_IMG} alt='VS' fill className='object-contain' unoptimized />
						</div>
						<span className={`text-xs font-bold ${p2wins ? "text-success" : "text-error"}`}>
							{p2wins ? "WINS" : "LOSES"}
						</span>
						<span className='text-[10px] text-base-content/40 text-center leading-tight'>
							{replay.replay_battle_type_name}
						</span>
					</div>

					<PlayerSide info={replay.player2_info} side='right' isWinner={p2wins} />
				</div>
			</div>
		</div>
	);
}

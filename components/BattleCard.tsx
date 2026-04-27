import Image from "next/image";
import Link from "next/link";
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

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function roundResultImg(value: number, side: "l" | "r"): string {
	return `${SF6_BASE}/profile/icon_result${value}_${side}.png`;
}

// ─── Header ───────────────────────────────────────────────────────────────────

function CardHeader({
	compact = false,
	replay,
	p1wins,
}: {
	compact?: boolean;
	replay: SF6Replay;
	p1wins: boolean;
}) {
	const date = new Date(replay.uploaded_at * 1000).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		!compact && (
			<div className='flex items-center justify-between gap-2 px-3 py-2 border-b border-base-300 flex-wrap'>
				<span className='text-xs text-primary font-semibold tracking-wide'>
					Replay ID{" "}
					<span className='text-base-content font-bold'>
						{replay.replay_id}
					</span>
				</span>

				<div className='flex flex-col items-center text-xs text-base-content/60 leading-tight'>
					<span className='font-semibold text-base-content'>
						{date}
					</span>
					<span>
						Views &nbsp;
						<span className='text-base-content/40'>0</span>
					</span>
				</div>
				<span
					className={`badge badge-sm font-bold px-3 py-3 text-white ${
						p1wins ? "badge-error" : "badge-success"
					}`}>
					{replay.replay_battle_type_name}
				</span>
			</div>
		)
	);
}

// ─── Round results (center column) ───────────────────────────────────────────

function RoundResults({
	p1Results,
	p2Results,
}: {
	p1Results: number[];
	p2Results: number[];
}) {
	const rounds = Math.max(p1Results.length, p2Results.length, 1);

	return (
		<div className='flex flex-col items-center justify-center gap-1 shrink-0 px-2'>
			{Array.from({ length: rounds }, (_, i) => {
				const v1 = p1Results[i] ?? 0;
				const v2 = p2Results[i] ?? 0;
				return (
					<div key={i} className='flex items-center gap-1'>
						<div className='relative w-5 h-3'>
							<Image
								src={roundResultImg(v1, "l")}
								alt=''
								fill
								className='object-contain'
								unoptimized
							/>
						</div>
						<span className='text-[10px] text-base-content/40 w-6 text-center'>
							R{i + 1}
						</span>
						<div className='relative w-5 h-3'>
							<Image
								src={roundResultImg(v2, "r")}
								alt=''
								fill
								className='object-contain'
								unoptimized
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

// ─── Player side ──────────────────────────────────────────────────────────────

function PlayerSide({
	info,
	side,
	isWinner,
	compact = false,
}: {
	info: SF6PlayerInfo;
	side: "left" | "right";
	isWinner: boolean;
	compact?: boolean;
}) {
	const charSide = side === "left" ? "l" : "r";
	const isRight = side === "right";

	const rankRow = (
		<>
			<div className='relative'>
				<Image
					src={rankImg(info.league_rank)}
					alt=''
					width={compact ? 64 : 128}
					height={compact ? 32 : 64}
					className='object-contain'
					unoptimized
				/>
			</div>
			<div
				className={`flex items-center gap-2 ${isRight ? "flex-row-reverse" : ""}`}>
				<span className='text-sm font-bold whitespace-nowrap'>
					{info.league_point.toLocaleString("pt-BR")} LP
				</span>
			</div>
		</>
	);

	const nameRow = (
		<Link
			href={`/battlelog/${info.player.short_id}/stats`}
			className={`flex items-center gap-1 text-sm font-semibold min-w-0 hover:text-primary transition-colors ${
				isRight ? "flex-row-reverse" : ""
			}`}>
			<Image
				src={controlImg(info.battle_input_type)}
				alt=''
				width={compact ? 16 : 32}
				height={compact ? 16 : 32}
				className='object-contain'
				unoptimized
			/>
			<span className='relative w-4 h-4 shrink-0 inline-block'>
				<Image
					src={platformImg(info.player.platform_tool_name)}
					alt=''
					width={compact ? 16 : 32}
					height={compact ? 16 : 32}
					className='object-contain'
					unoptimized
				/>
			</span>
			<span className='truncate'>{info.player.fighter_id}</span>
		</Link>
	);

	const portrait = (
		<div
			className={`relative shrink-0 ${!isWinner ? "opacity-40 grayscale" : ""}`}>
			<Image
				src={characterImg(info.playing_character_tool_name, charSide)}
				alt={info.playing_character_name}
				width={compact ? 64 : 128}
				height={compact ? 64 : 128}
				className='object-contain object-bottom'
				unoptimized
			/>
		</div>
	);

	const resultLabel = (
		<span
			className={`text-base font-black tracking-widest ${isWinner && !compact ? "text-success" : "text-base-content/40"}`}>
			{isWinner ? "WINS" : "LOSES"}
		</span>
	);

	return (
		<div
			className={`flex items-center gap-3 flex-1 min-w-0 ${isRight ? "flex-row-reverse" : ""}`}>
			{/* Info column */}
			<div
				className={`flex flex-col gap-1.5 min-w-0 flex-1 ${isRight ? "items-end" : "items-start"}`}>
				{nameRow}
				{rankRow}
			</div>

			{/* Portrait + result */}
			<div className={`flex flex-col items-center gap-1`}>
				{portrait}
				{resultLabel}
			</div>
		</div>
	);
}

// ─── BattleCard ───────────────────────────────────────────────────────────────

interface BattleCardProps {
	replay: SF6Replay;
	compact?: boolean;
}

export default function BattleCard({
	replay,
	compact = false,
}: BattleCardProps) {
	const winner = getWinner(replay);
	const p1wins = winner === 1;
	const p2wins = winner === 2;

	const battleRow = (
		<div className='flex items-center gap-2 px-3 py-3 flex-1'>
			<PlayerSide
				info={replay.player1_info}
				side='left'
				isWinner={p1wins}
				compact={compact}
			/>
			<RoundResults
				p1Results={replay.player1_info.round_results}
				p2Results={replay.player2_info.round_results}
			/>
			<PlayerSide
				info={replay.player2_info}
				side='right'
				isWinner={p2wins}
				compact={compact}
			/>
		</div>
	);

	return (
		<div
			className='card bg-base-100 border border-base-300 overflow-hidden'
			style={{
				height: compact ? 120 : "auto",
			}}>
			<CardHeader compact={compact} replay={replay} p1wins={p1wins} />
			{battleRow}
		</div>
	);
}

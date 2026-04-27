import { useEffect, useState } from "react";
import BattleCard from "../BattleCard";
import { type SF6Replay } from "../../lib/types";

const ROTATE_INTERVAL = 4000;

const CARD_STYLE: React.CSSProperties = {
	borderRadius: 20,
	overflow: "hidden",
};

interface Props {
	replays: SF6Replay[];
}

export default function BattlesCarousel({ replays }: Props) {
	const [slide, setSlide] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => setSlide((s) => s + 1), ROTATE_INTERVAL);
		return () => clearInterval(interval);
	}, []);

	const activeSlide = replays.length > 0 ? slide % replays.length : 0;

	if (replays.length === 0) return null;

	return (
		<div style={{ ...CARD_STYLE, width: 600, position: "relative" }}>
			{replays.map((replay, i) => (
				<div
					key={replay.replay_id}
					className={`absolute inset-0 transition-opacity duration-700 overflow-auto p-2 ${
						i === activeSlide ? "opacity-100" : "opacity-0 pointer-events-none"
					}`}
				>
					<BattleCard replay={replay} compact />
				</div>
			))}
			<div className='absolute bottom-3 right-6 flex gap-2'>
				{replays.map((_, i) => (
					<span
						key={i}
						className={`h-2 rounded-full transition-all duration-300 ${
							i === activeSlide ? "bg-white/80 w-6" : "bg-white/25 w-2"
						}`}
					/>
				))}
			</div>
		</div>
	);
}

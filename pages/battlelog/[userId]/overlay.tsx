import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { type CachedBattlelog } from "../../../lib/types";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

import BattlesCarousel from "../../../components/overlay/BattlesCarousel";
import ChromaBlock from "../../../components/overlay/ChromaBlock";
import OverlayPlayerCard from "../../../components/overlay/OverlayPlayerCard";

// ─── Layout constants (all in px) ────────────────────────────────────────────

const W = 1920;
const H = 1080;

const CARD_STYLE: React.CSSProperties = {
	borderRadius: 20,
	overflow: "hidden",
};

const DARK_BG: React.CSSProperties = {
	background: "rgba(15, 15, 20, 0.92)",
	backdropFilter: "blur(24px)",
	border: "1px solid rgba(255,255,255,0.08)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverlayPage() {
	const router = useRouter();
	const userId = String(router.query.userId ?? "");

	const [data, setData] = useState<CachedBattlelog | null>(null);

	async function fetchData() {
		if (!userId) return;
		try {
			const res = await fetch(`/api/overlay/${userId}`);
			if (res.ok) setData(await res.json());
		} catch (e) {
			console.error("[overlay] fetch error", e);
		}
	}

	useEffect(() => {
		if (!userId) return;
		fetchData();
		const es = new EventSource(`/api/overlay/${userId}/stream`);
		es.onmessage = () => fetchData();
		es.onerror = () => console.warn("[overlay] SSE reconnecting...");
		return () => es.close();
	}, [userId]);

	const lastReplays = data?.replays.slice(0, 3) ?? [];

	return (
		<div
			className='bg-transparent flex gap-2 p-2'
			style={{
				...CARD_STYLE,
				width: W,
				height: H,
				position: "relative",
				overflow: "hidden",
				backgroundImage: `url(https://www.streetfighter.com/6/buckler/assets/images/material/card/background/card_000.jpg)`,
			}}>
			<div
				className='bg-transparent flex gap-2 flex-col'
				style={{ width: 1600, height: "100%" }}>
				<ChromaBlock style={{ minHeight: 900, width: 1600 }} />

				<div
					style={{
						width: 1600,
						display: "flex",
						position: "relative",
						height: "100%",
					}}>
					{lastReplays.length > 0 ? (
						<BattlesCarousel replays={lastReplays} />
					) : (
						<div className='flex items-center justify-center h-full'>
							{data ? (
								<span
									className='text-white/30'
									style={{ fontSize: 22 }}>
									Nenhuma batalha encontrada.
								</span>
							) : (
								<span
									className='loading loading-spinner text-white/30'
									style={{ width: 40, height: 40 }}
								/>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Right column: game chroma + player card */}
			<div
				className='bg-transparent flex gap-2 flex-col'
				style={{ ...CARD_STYLE, width: "100%" }}>
				<ChromaBlock style={{ minHeight: 248 }} />

				{data ? (
					<div style={{ ...CARD_STYLE, ...DARK_BG }}>
						<OverlayPlayerCard data={data} />
					</div>
				) : (
					<div className='flex items-center justify-center w-full h-full'>
						<span
							className='loading loading-spinner text-white/30'
							style={{ width: 48, height: 48 }}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

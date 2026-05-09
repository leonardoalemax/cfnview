"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CachedBattlelog } from "../../../../lib/types";
import BattlesCarousel from "../../../../components/overlay/BattlesCarousel";
import ChromaBlock from "../../../../components/overlay/ChromaBlock";
import OverlayPlayerCard from "../../../../components/overlay/OverlayPlayerCard";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

const CARD_STYLE: React.CSSProperties = { borderRadius: 20, overflow: "hidden" };
const DARK_BG: React.CSSProperties = {
	background: "rgba(15, 15, 20, 0.92)",
	backdropFilter: "blur(24px)",
	border: "1px solid rgba(255,255,255,0.08)",
};

const W = 1920;
const H = 1080;

export default function OverlayPage() {
	const { userId } = useParams<{ userId: string }>();
	const [data, setData] = useState<CachedBattlelog | null>(null);

	async function fetchData() {
		if (!userId) return;
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}`,
			);
			if (res.ok) setData(await res.json());
		} catch (e) {
			console.error("[overlay] fetch error", e);
		}
	}

	useEffect(() => {
		if (!userId) return;

		fetchData();

		const wsUrl = `${process.env.NEXT_PUBLIC_GO_WS_URL}/v1/battlelog/${userId}/ws`;
		const ws = new WebSocket(wsUrl);

		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				if (msg.type === "update") fetchData();
			} catch {}
		};

		ws.onerror = () => console.warn("[overlay] WebSocket error, reconnecting...");

		// Reconnect on close after a short delay
		ws.onclose = () => {
			setTimeout(() => {
				window.location.reload();
			}, 5000);
		};

		return () => ws.close();
	}, [userId]);

	const lastReplays = data?.replays.slice(0, 3) ?? [];
	const bgUrl = `${SF6_BASE}/material/card/background/card_000.jpg`;

	return (
		<div
			className="flex gap-2 p-2"
			style={{ ...CARD_STYLE, width: W, height: H, position: "relative", overflow: "hidden" }}
		>
			<style>{`
				@keyframes bgPan {
					0%   { background-position: 0px 0px; }
					100% { background-position: 1920px 648px; }
				}
				.overlay-bg { animation: bgPan 50s linear infinite; }
			`}</style>

			<div
				className="overlay-bg absolute inset-0 pointer-events-none"
				style={{
					backgroundImage: `url(${bgUrl})`,
					backgroundSize: "1920px 1080px",
					backgroundRepeat: "repeat",
					filter: "brightness(0.35)",
					zIndex: 0,
				}}
			/>

			<div
				className="bg-transparent flex gap-2 flex-col"
				style={{ width: 1600, height: "100%", position: "relative", zIndex: 1 }}
			>
				<ChromaBlock style={{ minHeight: 900, width: 1600 }} />
				<div style={{ width: 1600, display: "flex", position: "relative", height: "100%" }}>
					{lastReplays.length > 0 ? (
						<BattlesCarousel replays={lastReplays} />
					) : (
						<div className="flex items-center justify-center h-full">
							{data ? (
								<span className="text-white/30" style={{ fontSize: 22 }}>
									Nenhuma batalha encontrada.
								</span>
							) : (
								<span className="loading loading-spinner text-white/30" style={{ width: 40, height: 40 }} />
							)}
						</div>
					)}
				</div>
			</div>

			<div
				className="bg-transparent flex gap-2 flex-col"
				style={{ ...CARD_STYLE, width: "100%", position: "relative", zIndex: 1 }}
			>
				<ChromaBlock style={{ minHeight: 248 }} />
				{data ? (
					<div style={{ ...CARD_STYLE, ...DARK_BG }}>
						<OverlayPlayerCard data={data} />
					</div>
				) : (
					<div className="flex items-center justify-center w-full h-full">
						<span className="loading loading-spinner text-white/30" style={{ width: 48, height: 48 }} />
					</div>
				)}
			</div>
		</div>
	);
}

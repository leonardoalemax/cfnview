"use client";

import { useEffect, useRef, useState } from "react";
import BattleCard from "./BattleCard";
import { Tab, TabList } from "./ui/Tabs";
import type { CharacterOption, ReplayPage, SF6Replay } from "../lib/types";

const PAGE_SIZE = 20;
const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function characterFace(toolName: string): string {
	return `${SF6_BASE}/praise/fighter/${toolName}/face1.png`;
}

async function fetchReplays(
	userId: string,
	page: number,
	character: string,
	dateFrom: string,
	dateTo: string,
	battleType: number,
): Promise<ReplayPage> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(PAGE_SIZE),
	});
	if (character) params.set("character", character);
	if (dateFrom) params.set("date_from", String(Math.floor(new Date(dateFrom).getTime() / 1000)));
	if (dateTo) params.set("date_to", String(Math.floor(new Date(dateTo + "T23:59:59").getTime() / 1000)));
	if (battleType !== 0) params.set("battle_type", String(battleType));

	const url = `${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/replays?${params}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`API error ${res.status}`);
	return res.json();
}

interface Props {
	userId: string;
	userName?: string;
	initialReplays: SF6Replay[];
	totalPages: number;
	initialCharacters?: CharacterOption[];
}

export default function HistoryList({ userId, userName, initialReplays, totalPages, initialCharacters = [] }: Props) {
	const [characters, setCharacters] = useState<CharacterOption[]>(initialCharacters);
	const [character, setCharacter] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [battleType, setBattleType] = useState(0);

	const [replays, setReplays] = useState<SF6Replay[]>(initialReplays);
	const [page, setPage] = useState(2);
	const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
	const [hasMore, setHasMore] = useState(totalPages > 1);
	const [loading, setLoading] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const loadingRef = useRef(false);

	// Fetch characters if not pre-loaded
	useEffect(() => {
		if (initialCharacters.length > 0) return;
		fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/characters`)
			.then((r) => r.json())
			.then((data: CharacterOption[]) => setCharacters(data))
			.catch(() => {});
	}, [userId, initialCharacters.length]);

	// Reset when filters change
	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		loadingRef.current = true;

		fetchReplays(userId, 1, character, dateFrom, dateTo, battleType)
			.then((data) => {
				if (!cancelled) {
					setReplays(data.replays);
					setCurrentTotalPages(data.total_pages);
					setHasMore(data.total_pages > 1);
					setPage(2);
				}
			})
			.catch((err) => console.error("[HistoryList] filter fetch error:", err))
			.finally(() => {
				if (!cancelled) {
					loadingRef.current = false;
					setLoading(false);
				}
			});

		return () => { cancelled = true; };
	}, [userId, character, dateFrom, dateTo, battleType]);

	// Infinite scroll
	useEffect(() => {
		if (!hasMore) return;

		let cancelled = false;

		async function load() {
			if (loadingRef.current || !hasMore) return;
			loadingRef.current = true;
			setLoading(true);
			try {
				const data = await fetchReplays(userId, page, character, dateFrom, dateTo, battleType);
				if (!cancelled) {
					setReplays((prev) => [...prev, ...data.replays]);
					setHasMore(data.page < data.total_pages);
					setPage((p) => p + 1);
				}
			} catch (err) {
				console.error("[HistoryList] fetch error:", err);
			} finally {
				if (!cancelled) {
					loadingRef.current = false;
					setLoading(false);
				}
			}
		}

		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) load(); },
			{ rootMargin: "200px" },
		);

		if (sentinelRef.current) observer.observe(sentinelRef.current);

		return () => {
			cancelled = true;
			observer.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, hasMore, userId, character, dateFrom, dateTo, battleType]);

	return (
		<div className="flex flex-col gap-4">
			{/* Breadcrumb */}
			<div className="breadcrumbs text-sm">
				<ul>
					<li>
						<a href={`/battlelog/${userId}/stats`}>
							{userName || userId}
						</a>
					</li>
					<li>Histórico</li>
				</ul>
			</div>

			{/* Filters */}
			<div className="card bg-base-200 p-4 flex flex-col gap-4">
				{/* Battle type filter */}
				<div>
					<div className="text-xs text-base-content/50 mb-2">Tipo de partida</div>
					<TabList>
						{[
							{ value: 0, label: "Todos" },
							{ value: 1, label: "Ranked" },
							{ value: 6, label: "Custom Room" },
						].map(({ value, label }) => (
							<Tab key={value} active={battleType === value} onClick={() => setBattleType(value)}>
								{label}
							</Tab>
						))}
					</TabList>
				</div>

				{/* Character filter */}
				{characters.length > 0 && (
					<div>
						<div className="text-xs text-base-content/50 mb-2">Personagem</div>
						<TabList scrollable>
							<Tab active={character === ""} onClick={() => setCharacter("")}>Todos</Tab>
							{characters.map((c) => (
								<Tab key={c.tool_name} active={character === c.tool_name} onClick={() => setCharacter(c.tool_name)} className="px-2">
									<img src={characterFace(c.tool_name)} alt={c.name} className="w-6 h-6 rounded-full object-cover" title={c.name} />
									<span className="ml-1 hidden sm:inline">{c.name}</span>
								</Tab>
							))}
						</TabList>
					</div>
				)}

				{/* Date range filter */}
				<div className="flex flex-wrap gap-3 items-end">
					<div className="flex flex-col gap-1">
						<label className="text-xs text-base-content/50">De</label>
						<input
							type="date"
							className="input input-sm input-bordered"
							value={dateFrom}
							onChange={(e) => setDateFrom(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs text-base-content/50">Até</label>
						<input
							type="date"
							className="input input-sm input-bordered"
							value={dateTo}
							onChange={(e) => setDateTo(e.target.value)}
						/>
					</div>
					{(dateFrom || dateTo) && (
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => { setDateFrom(""); setDateTo(""); }}
						>
							Limpar datas
						</button>
					)}
				</div>
			</div>

			{/* Replay list */}
			<ul className="flex flex-col gap-3">
				{replays.map((replay) => (
					<li key={replay.replay_id}>
						<BattleCard replay={replay} userId={userId} />
					</li>
				))}
			</ul>

			<div ref={sentinelRef} className="py-6 flex justify-center">
				{loading && (
					<span className="loading loading-spinner loading-md text-primary" />
				)}
				{!loading && !hasMore && replays.length > 0 && (
					<span className="text-sm text-base-content/40">Fim dos replays</span>
				)}
				{!loading && replays.length === 0 && (
					<span className="text-sm text-base-content/40">Nenhum replay encontrado</span>
				)}
			</div>
		</div>
	);
}

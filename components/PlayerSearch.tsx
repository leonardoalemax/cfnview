"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { PlayerEntry } from "../lib/types";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
}

export default function PlayerSearch() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<PlayerEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const debouncedQuery = useDebounce(query, 300);

	useEffect(() => {
		if (debouncedQuery.trim().length < 2) {
			setResults([]);
			setOpen(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		fetch(`/api/players/search?q=${encodeURIComponent(debouncedQuery)}`)
			.then((r) => r.json())
			.then((data: PlayerEntry[]) => {
				if (!cancelled) {
					setResults(data);
					setOpen(data.length > 0);
					setLoading(false);
				}
			})
			.catch(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [debouncedQuery]);

	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);

	function select(player: PlayerEntry) {
		setOpen(false);
		setQuery("");
		router.push(`/battlelog/${player.short_id}/stats`);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (results.length > 0) select(results[0]);
		else if (query.trim()) router.push(`/battlelog/${query.trim()}/stats`);
	}

	return (
		<div ref={containerRef} className="relative w-full max-w-md">
			<form onSubmit={handleSubmit} className="flex gap-2">
				<label className="input input-bordered flex items-center gap-2 flex-1">
					{loading ? (
						<span className="loading loading-spinner loading-xs text-base-content/40" />
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
						</svg>
					)}
					<input
						type="text"
						className="grow"
						placeholder="Fighter ID ou nome…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => results.length > 0 && setOpen(true)}
						autoComplete="off"
					/>
				</label>
				<button type="submit" className="btn btn-primary">Buscar</button>
			</form>

			{open && (
				<ul className="absolute z-50 mt-1 w-full bg-base-200 border border-base-300 rounded-box shadow-xl max-h-72 overflow-y-auto">
					{results.map((p) => (
						<li key={p.fighter_id}>
							<button
								className="flex items-center gap-3 w-full px-4 py-2 hover:bg-base-300 text-left transition-colors"
								onClick={() => select(p)}
							>
								{p.character_tool_name && (
									<img
										src={`${SF6_BASE}/material/character/character_${p.character_tool_name}_l.png`}
										alt={p.character_tool_name}
										className="w-8 h-8 object-contain shrink-0"
									/>
								)}
								<div className="flex flex-col min-w-0">
									<span className="font-semibold truncate">{p.fighter_id}</span>
									<span className="text-xs text-base-content/50">ID: {p.short_id}</span>
								</div>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

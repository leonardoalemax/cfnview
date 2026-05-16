"use client";

import { useEffect, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import clsx from "clsx";
import type { CharacterOption, LPHistory } from "../lib/types";
import StatCard from "./ui/StatCard";
import SectionTitle from "./ui/SectionTitle";
import { Tab, TabList } from "./ui/Tabs";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

const RANKS = [
	{ lp: 1000,  label: "Iron",     color: "#8b7355" },
	{ lp: 3000,  label: "Bronze",   color: "#cd7f32" },
	{ lp: 5000,  label: "Silver",   color: "#9ca3af" },
	{ lp: 9000,  label: "Gold",     color: "#eab308" },
	{ lp: 13000, label: "Platinum", color: "#67e8f9" },
	{ lp: 19000, label: "Diamond",  color: "#818cf8" },
	{ lp: 25000, label: "Master",   color: "#f472b6" },
];

function formatDate(date: string): string {
	const [, m, d] = date.split("-");
	return `${d}/${m}`;
}

function characterFace(toolName: string): string {
	return `${SF6_BASE}/praise/fighter/${toolName}/face1.png`;
}

interface Props {
	userId: string;
	defaultCharacter: string; // profile favorite character tool_name
	initialData: LPHistory | null;
	initialCharacters: CharacterOption[];
}

export default function LPChart({ userId, defaultCharacter, initialData, initialCharacters }: Props) {
	const [characters, setCharacters] = useState<CharacterOption[]>(initialCharacters);
	const [selected, setSelected] = useState(defaultCharacter);
	const [data, setData] = useState<LPHistory | null>(initialData);
	const [loading, setLoading] = useState(false);

	// Fetch characters if not pre-loaded
	useEffect(() => {
		if (initialCharacters.length > 0) return;
		fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/characters`)
			.then((r) => r.json())
			.then((list: CharacterOption[]) => {
				setCharacters(list);
				if (!selected && list.length > 0) setSelected(list[0].tool_name);
			})
			.catch(() => {});
	}, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

	// Fetch LP history when character changes (skip if using initial data on first render)
	const isFirstRender = data === initialData && selected === defaultCharacter;
	useEffect(() => {
		if (isFirstRender) return;
		if (!selected) return;
		let cancelled = false;
		setLoading(true);
		const url = `${process.env.NEXT_PUBLIC_GO_API_URL}/v1/battlelog/${userId}/lp-history?character=${selected}`;
		fetch(url)
			.then((r) => r.json())
			.then((d: LPHistory) => { if (!cancelled) setData(d); })
			.catch(() => {})
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [selected, userId]); // eslint-disable-line react-hooks/exhaustive-deps

	const entries = data?.entries ?? [];

	return (
		<StatCard>
			<SectionTitle
				aside={
					entries.length >= 2 ? (() => {
						const delta = entries[entries.length - 1].lp - entries[0].lp;
						return (
							<span className={clsx("text-xs font-semibold", delta >= 0 ? "text-success" : "text-error")}>
								{delta >= 0 ? "+" : ""}{delta} LP
							</span>
						);
					})() : null
				}
			>
				Evolução de LP
			</SectionTitle>

			{/* Character selector */}
			{characters.length > 0 && (
				<TabList scrollable className="mb-3">
					{characters.map((c) => (
						<Tab key={c.tool_name} active={selected === c.tool_name} onClick={() => setSelected(c.tool_name)} className="px-2">
							<img src={characterFace(c.tool_name)} alt={c.name} className="w-6 h-6 rounded-full object-cover" title={c.name} />
							<span className="ml-1 hidden sm:inline text-xs">{c.name}</span>
						</Tab>
					))}
				</TabList>
			)}

			{loading && (
				<div className="flex justify-center py-8">
					<span className="loading loading-spinner loading-md text-primary" />
				</div>
			)}

			{!loading && entries.length === 0 && (
				<div className="text-sm text-base-content/40 text-center py-8">
					Sem dados para este personagem
				</div>
			)}

			{!loading && entries.length > 0 && (() => {
				const minLP = Math.min(...entries.map((e) => e.lp));
				const maxLP = Math.max(...entries.map((e) => e.lp));
				const visibleRanks = RANKS.filter((r) => r.lp >= minLP - 1500 && r.lp <= maxLP + 1500);
				const yMin = Math.min(minLP, ...visibleRanks.map((r) => r.lp)) - 200;
				const yMax = Math.max(maxLP, ...visibleRanks.map((r) => r.lp)) + 200;

				return (
					<ResponsiveContainer width="100%" height={200}>
						<LineChart data={entries} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
							<XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} minTickGap={32} />
							<YAxis tick={{ fontSize: 11 }} width={48} domain={[yMin, yMax]} />
							<Tooltip
								contentStyle={{
									background: "#1e1b3a",
									border: "1px solid rgba(255,255,255,0.12)",
									borderRadius: "0.5rem",
									fontSize: "0.75rem",
								}}
								labelFormatter={(label) => label}
								formatter={(value) => [`${value} LP`, "LP"]}
							/>
							{visibleRanks.map((r) => (
								<ReferenceLine
									key={r.lp}
									y={r.lp}
									stroke={r.color}
									strokeDasharray="4 3"
									strokeOpacity={0.6}
									label={{ value: r.label, position: "insideTopRight", fill: r.color, fontSize: 10, opacity: 0.8 }}
								/>
							))}
							<Line type="monotone" dataKey="lp" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
						</LineChart>
					</ResponsiveContainer>
				);
			})()}
		</StatCard>
	);
}

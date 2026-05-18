"use client";

import { useCallback, useEffect, useState } from "react";
import type { CharacterOption, CharStat, LPHistory } from "../lib/types";
import LPChart from "./LPChart";
import OpponentChart from "./OpponentChart";
import CharacterIcon from "./ui/CharacterIcon";
import { Tab, TabList } from "./ui/Tabs";

const API = process.env.NEXT_PUBLIC_GO_API_URL ?? "";

interface Props {
	userId: string;
	defaultCharacter: string;
	initialLPData: LPHistory | null;
	initialCharacters: CharacterOption[];
	initialOpponents: CharStat[] | null;
}

export default function PlayerAnalysis({
	userId,
	defaultCharacter,
	initialLPData,
	initialCharacters,
	initialOpponents,
}: Props) {
	const [characters, setCharacters] = useState<CharacterOption[]>(initialCharacters);
	const [selected, setSelected] = useState(defaultCharacter);
	const [lpData, setLpData] = useState<LPHistory | null>(initialLPData);
	const [opponents, setOpponents] = useState<CharStat[] | null>(initialOpponents);
	const [loading, setLoading] = useState(false);

	// Fetch characters if not pre-loaded
	useEffect(() => {
		if (initialCharacters.length > 0) return;
		fetch(`${API}/v1/battlelog/${userId}/characters`)
			.then((r) => r.json())
			.then((list: CharacterOption[]) => {
				setCharacters(list);
				if (!selected && list.length > 0) setSelected(list[0].tool_name);
			})
			.catch(() => {});
	}, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

	// Fetch data when character changes
	const isFirst = lpData === initialLPData && selected === defaultCharacter;
	useEffect(() => {
		if (isFirst) return;
		if (!selected) return;
		let cancelled = false;
		setLoading(true);

		const charQ = `?character=${selected}`;
		Promise.all([
			fetch(`${API}/v1/battlelog/${userId}/lp-history${charQ}`).then((r) => r.json()),
			fetch(`${API}/v1/battlelog/${userId}/opponents${charQ}`).then((r) => r.json()),
		])
			.then(([lp, opp]) => {
				if (cancelled) return;
				setLpData(lp);
				setOpponents(opp);
			})
			.catch(() => {})
			.finally(() => { if (!cancelled) setLoading(false); });

		return () => { cancelled = true; };
	}, [selected, userId]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-4">
			{/* Unified character filter */}
			{characters.length > 1 && (
				<TabList scrollable className="">
					{characters.map((c) => (
						<Tab
							key={c.tool_name}
							active={selected === c.tool_name}
							onClick={() => setSelected(c.tool_name)}
							className="px-2"
						>
							<CharacterIcon toolName={c.tool_name} className="w-6 h-6 rounded-full object-cover" />
							<span className="ml-1 hidden sm:inline text-xs">{c.name}</span>
						</Tab>
					))}
				</TabList>
			)}

			<div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
				<div className="flex flex-col gap-4">
					<LPChart data={lpData} />
					<OpponentChart
						data={opponents}
						userId={userId}
						selectedCharacter={selected}
						section="list"
					/>
					<OpponentChart
						data={opponents}
						userId={userId}
						selectedCharacter={selected}
						section="training"
					/>
				</div>
			</div>
		</div>
	);
}

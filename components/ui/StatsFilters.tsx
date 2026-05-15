"use client";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

export function rankImg(rank: number) {
	return `https://www.streetfighter.com/6/buckler/assets/images/stats/rank${rank}.png`;
}

export interface LeagueTab {
	rank: number;
	alpha: string;
}

interface Props {
	// Month selector
	monthOptions: { value: string; label: string }[];
	selectedMonth: string;
	onMonthChange: (v: string) => void;

	// Todos / Classic / Modern
	selectedInputType: string;
	onInputTypeChange: (v: string) => void;

	// League rank tabs
	leagueTabs: LeagueTab[];
	selectedLeague: string;
	onLeagueChange: (v: string) => void;
}

const INPUT_TYPES = [
	{ value: "0", label: "Todos", icon: null },
	{ value: "1", label: "Classic", icon: `${SF6_BASE}/common/icon_controltype1.png` },
	{ value: "2", label: "Modern", icon: `${SF6_BASE}/common/icon_controltype2.png` },
] as const;

export default function StatsFilters({
	monthOptions,
	selectedMonth,
	onMonthChange,
	selectedInputType,
	onInputTypeChange,
	leagueTabs,
	selectedLeague,
	onLeagueChange,
}: Props) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-2 flex-wrap">
				<select
					className="select select-sm select-bordered"
					value={selectedMonth}
					onChange={(e) => onMonthChange(e.target.value)}
				>
					{monthOptions.map((m) => (
						<option key={m.value} value={m.value}>{m.label}</option>
					))}
				</select>

				<div role="tablist" className="tabs tabs-box">
					{INPUT_TYPES.map(({ value, label, icon }) => (
						<button
							key={value}
							role="tab"
							onClick={() => onInputTypeChange(value)}
							className={`tab gap-1.5 ${selectedInputType === value ? "tab-active" : ""}`}
						>
							{icon && <img src={icon} alt={label} className="w-4 h-4 object-contain" />}
							{label}
						</button>
					))}
				</div>
			</div>

			{leagueTabs.length > 0 && (
				<div role="tablist" className="tabs tabs-box w-full">
					{leagueTabs.map((l) => (
						<button
							key={l.alpha}
							role="tab"
							onClick={() => onLeagueChange(l.alpha)}
							className={`tab flex-1 flex-col gap-0.5 h-auto py-1.5 ${selectedLeague === l.alpha ? "tab-active" : ""}`}
						>
							{l.rank > 0 ? (
								<img
									src={rankImg(l.rank)}
									alt={l.alpha}
									className="w-7 h-7 object-contain"
								/>
							) : (
								<span className="text-xs font-semibold">{l.alpha}</span>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

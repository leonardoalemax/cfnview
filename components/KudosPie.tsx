"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Cores fixas (recharts/SVG não resolve var(--p) do DaisyUI)
const KUDOS_COLORS = {
	fg: "#605dff", // primary (azul/roxo)
	wt: "#f7b32b", // secondary (amarelo)
	bh: "#22d3ee", // accent (ciano)
};

interface Props {
	fightingGround: number;
	worldTour: number;
	battleHub: number;
}

export default function KudosPie({
	fightingGround,
	worldTour,
	battleHub,
}: Props) {
	const total = fightingGround + worldTour + battleHub;

	const pieData = [
		{
			name: "Fighting Ground",
			short: "FG",
			value: fightingGround,
			color: KUDOS_COLORS.fg,
		},
		{
			name: "World Tour",
			short: "WT",
			value: worldTour,
			color: KUDOS_COLORS.wt,
		},
		{
			name: "Battle Hub",
			short: "BH",
			value: battleHub,
			color: KUDOS_COLORS.bh,
		},
	].filter((d) => d.value > 0);

	return (
		<div className='min-w-fit flex flex-row gap-3 items-center'>
			<div className='shrink-0'>
				<p className='text-xs text-base-content/50 mb-0.5'>Kudos</p>
				<p className='font-bold mb-1'>
					{total.toLocaleString("pt-BR")}
				</p>
			</div>

			<div className='w-12 h-12 shrink-0'>
				{total > 0 && (
					<ResponsiveContainer width='100%' height='100%'>
						<PieChart>
							<Pie
								data={pieData}
								dataKey='value'
								nameKey='name'
								innerRadius='55%'
								outerRadius='100%'
								paddingAngle={2}
								strokeWidth={0}
								isAnimationActive={false}>
								{pieData.map((d) => (
									<Cell key={d.short} fill={d.color} />
								))}
							</Pie>
							<Tooltip
								formatter={(v: any, name: any) => [
									Number(v).toLocaleString("pt-BR"),
									name,
								]}
								contentStyle={{
									background: "rgba(0,0,0,0.85)",
									border: "1px solid rgba(255,255,255,0.15)",
									borderRadius: 6,
									fontSize: 11,
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				)}
			</div>

			<div className='flex flex-col gap-0.5 text-[10px] text-base-content/70 flex-1'>
				{pieData.map((d) => (
					<div key={d.short} className='flex items-center gap-1.5'>
						<span
							className='w-2 h-2 rounded-sm shrink-0'
							style={{ background: d.color }}
						/>
						<span className='font-bold'>{d.short}</span>
						<span className='tabular-nums'>
							{d.value.toLocaleString("pt-BR")}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

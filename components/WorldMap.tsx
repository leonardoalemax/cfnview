"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleSequentialLog } from "d3-scale";
import { interpolateViridis } from "d3-scale-chromatic";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import type { CountryPlayerCount } from "../lib/types";

countries.registerLocale(enLocale);

// TopoJSON dos países (world-atlas v2, ~100kb). Já tem `id` numeric ISO 3166-1.
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Props {
	data: CountryPlayerCount[];
}

interface Tooltip {
	x: number;
	y: number;
	name: string;
	count: number | null;
}

export default function WorldMap({ data }: Props) {
	// Indexa data por ISO numeric (chave usada pelo TopoJSON)
	// O backend devolve ISO3 (BRA); precisamos converter pra numeric (076)
	const byNumeric = useMemo(() => {
		const map = new Map<string, CountryPlayerCount>();
		for (const c of data) {
			if (!c.iso3) continue;
			const numeric = countries.alpha3ToNumeric(c.iso3);
			if (numeric) map.set(numeric, c);
		}
		return map;
	}, [data]);

	// Escala de cor (log porque os valores variam de 1 a milhões)
	const maxCount = useMemo(
		() => Math.max(1, ...data.map((d) => d.player_count)),
		[data],
	);
	const colorScale = useMemo(
		() => scaleSequentialLog(interpolateViridis).domain([1, maxCount]),
		[maxCount],
	);

	const [tooltip, setTooltip] = useState<Tooltip | null>(null);

	return (
		<div className="relative w-full">
			<ComposableMap
				projection="geoMercator"
				projectionConfig={{ scale: 130 }}
				style={{ width: "100%", height: "auto" }}
			>
				<Geographies geography={GEO_URL}>
					{({ geographies }) =>
						geographies.map((geo) => {
							const numeric = String(geo.id).padStart(3, "0");
							const entry = byNumeric.get(numeric);
							const count = entry?.player_count ?? 0;
							const fill = count > 0 ? colorScale(count) : "#1e293b";
							const name = entry?.country_name
								?? geo.properties.name
								?? "Desconhecido";

							return (
								<Geography
									key={geo.rsmKey}
									geography={geo}
									fill={String(fill)}
									stroke="#0f172a"
									strokeWidth={0.4}
									onMouseEnter={(e) =>
										setTooltip({
											x: e.clientX,
											y: e.clientY,
											name,
											count: count > 0 ? count : null,
										})
									}
									onMouseMove={(e) =>
										setTooltip((t) =>
											t ? { ...t, x: e.clientX, y: e.clientY } : t,
										)
									}
									onMouseLeave={() => setTooltip(null)}
									style={{
										default: { outline: "none" },
										hover: { fill: "#fbbf24", outline: "none", cursor: "pointer" },
										pressed: { outline: "none" },
									}}
								/>
							);
						})
					}
				</Geographies>
			</ComposableMap>

			{tooltip && (
				<div
					className="fixed pointer-events-none z-50 bg-base-100 border border-base-300 rounded-md px-3 py-2 shadow-lg text-xs"
					style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
				>
					<div className="font-semibold">{tooltip.name}</div>
					{tooltip.count !== null ? (
						<div className="text-base-content/70">
							{tooltip.count.toLocaleString("pt-BR")} jogadores
						</div>
					) : (
						<div className="text-base-content/40">sem dados</div>
					)}
				</div>
			)}

			{/* Legenda */}
			<div className="flex items-center justify-end gap-2 mt-2 text-xs text-base-content/60">
				<span>1</span>
				<div
					className="h-2 w-32 rounded"
					style={{
						background: `linear-gradient(to right, ${colorScale(1)}, ${colorScale(Math.sqrt(maxCount))}, ${colorScale(maxCount)})`,
					}}
				/>
				<span>{maxCount.toLocaleString("pt-BR")}</span>
				<span className="ml-2">jogadores</span>
			</div>
		</div>
	);
}

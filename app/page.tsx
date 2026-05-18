import PlayerSearch from "../components/PlayerSearch";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";
const heroChar = (name: string, side: "l" | "r") =>
	`${SF6_BASE}/material/character/character_${name}_${side}.png`;

const FEATURES = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
				<path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
			</svg>
		),
		title: "Historico completo",
		description: "Gravamos 3x ao dia. A CFN guarda so 100 replays — aqui voce nunca perde uma batalha.",
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
				<path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
			</svg>
		),
		title: "Dados para evoluir",
		description: "Win rate, LP, heatmaps, ranking por personagem — tudo pra entender onde melhorar.",
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
				<circle cx="12" cy="12" r="10" /><path d="m16 10-4 4-2-2" />
			</svg>
		),
		title: "Treine o que importa",
		description: "Sugestoes baseadas em derrotas, uso global e matchups oficiais.",
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
				<polyline points="12 8 12 12 14 14" /><circle cx="12" cy="12" r="10" />
			</svg>
		),
		title: "Melhor hora pra jogar",
		description: "Descubra quando voce joga melhor com base no seu historico real.",
	},
];

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col">
			{/* Hero — full width with character art */}
			<section className="relative overflow-hidden flex items-center justify-center min-h-[85vh] px-4">
				{/* Background characters */}
				<img
					src={heroChar("ryu", "l")}
					alt=""
					className="absolute left-0 bottom-0 h-[70vh] max-h-[600px] object-contain opacity-15 pointer-events-none select-none hidden sm:block"
				/>
				<img
					src={heroChar("luke", "r")}
					alt=""
					className="absolute right-0 bottom-0 h-[70vh] max-h-[600px] object-contain opacity-15 pointer-events-none select-none hidden sm:block"
				/>

				{/* Gradient overlays */}
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base-100 pointer-events-none" />

				{/* Content */}
				<div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-xl">
					<div className="flex flex-col gap-2">
						<span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary font-semibold">
							Street Fighter 6
						</span>
						<h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
							Seu historico
							<br />
							<span className="text-primary">sem limite</span>
						</h1>
					</div>

					<p className="text-base-content/50 text-base sm:text-lg max-w-md leading-relaxed">
						A CFN guarda apenas seus ultimos <span className="text-error font-bold">100</span> replays.
						Nos salvamos <span className="text-success font-bold">tudo</span>, 3 vezes ao dia.
					</p>

					<div className="w-full max-w-md">
						<PlayerSearch />
					</div>

					<p className="text-base-content/30 text-xs">
						Busque seu Fighter ID. Sem cadastro, sem login.
					</p>
				</div>
			</section>

			{/* Features */}
			<section className="px-4 py-16 sm:py-24">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-center text-2xl sm:text-3xl font-bold mb-12">
						Por que usar o <span className="text-primary">zerei.club</span>?
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{FEATURES.map((f) => (
							<div key={f.title} className="sf6-panel p-6 sm:p-8 flex items-start gap-4">
								<div className="text-primary shrink-0 mt-0.5">{f.icon}</div>
								<div className="flex flex-col gap-1.5">
									<h3 className="font-bold">{f.title}</h3>
									<p className="text-sm text-base-content/50 leading-relaxed">{f.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}

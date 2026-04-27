interface AppNavbarProps {
	title: string;
	subtitle?: string | null;
}

export default function AppNavbar({ title, subtitle }: AppNavbarProps) {
	return (
		<div className="navbar bg-base-100 border-b border-base-300 mb-4 px-0 min-h-12">
			<div className="navbar-start flex flex-col items-start justify-center">
				<span className="text-xl font-bold leading-tight">{title}</span>
				{subtitle && (
					<span className="text-[11px] text-base-content/40 leading-tight">{subtitle}</span>
				)}
			</div>
		</div>
	);
}

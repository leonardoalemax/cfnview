interface SectionTitleProps {
	children: React.ReactNode;
	subtitle?: string;
	aside?: React.ReactNode;
}

export default function SectionTitle({ children, subtitle, aside }: SectionTitleProps) {
	return (
		<div className="flex items-center justify-between flex-wrap gap-2">
			<div>
				<h2 className="card-title text-base">{children}</h2>
				{subtitle && <p className="text-xs text-base-content/50 mt-0.5">{subtitle}</p>}
			</div>
			{aside && <div>{aside}</div>}
		</div>
	);
}

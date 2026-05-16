import clsx from "clsx";

interface StatRowProps {
	label: string;
	value: React.ReactNode;
	valueClassName?: string;
}

export default function StatRow({ label, value, valueClassName = "" }: StatRowProps) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-xs text-base-content/60">{label}</span>
			<span className={clsx("font-semibold text-xs", valueClassName)}>{value}</span>
		</div>
	);
}

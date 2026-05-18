import clsx from "clsx";

interface StatCardProps {
	children: React.ReactNode;
	className?: string;
	bodyClassName?: string;
}

export default function StatCard({
	children,
	className = "",
	bodyClassName = "",
}: StatCardProps) {
	return (
		<div
			className={clsx("sf6-panel card bg-no-repeat bg-right", className)}>
			<div className={clsx("card-body p-4 gap-4", bodyClassName)}>
				{children}
			</div>
		</div>
	);
}

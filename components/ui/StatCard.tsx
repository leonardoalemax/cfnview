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
			style={{
				borderRadius: 0,
				backgroundColor: "rgba(50, 50, 100, 0.6)",
				clipPath:
					"polygon(min(1.1979166667vw,23px) 0,100% 0,100% calc(100% - min(1.1979166667vw, 23px)),calc(100% - min(1.1979166667vw, 23px)) 100%,0 100%,0 min(1.1979166667vw,23px))",
			}}
			className={clsx("card bg-no-repeat bg-right", className)}>
			<div className={clsx("card-body p-4 gap-4", bodyClassName)}>
				{children}
			</div>
		</div>
	);
}

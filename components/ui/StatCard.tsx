interface StatCardProps {
	children: React.ReactNode;
	className?: string;
	bodyClassName?: string;
}

export default function StatCard({ children, className = "", bodyClassName = "" }: StatCardProps) {
	return (
		<div className={`card bg-base-200 border border-base-300 ${className}`}>
			<div className={`card-body p-4 gap-4 ${bodyClassName}`}>
				{children}
			</div>
		</div>
	);
}

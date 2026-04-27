interface PageLayoutProps {
	children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
	return (
		<main className="min-h-screen p-4 sm:p-6">
			<div className="max-w-3xl mx-auto">
				{children}
			</div>
		</main>
	);
}

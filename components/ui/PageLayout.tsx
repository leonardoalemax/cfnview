interface PageLayoutProps {
	children: React.ReactNode;
	character?: string;
}

export default function PageLayout({ children, character }: PageLayoutProps) {
	return (
		<main className={`min-h-screen p-4 sm:p-6 bg-no-repeat`}>
			<div className='max-w-3xl mx-auto'>{children}</div>
		</main>
	);
}

import PageLayout from "../../components/ui/PageLayout";

export default function DadosLayout({ children }: { children: React.ReactNode }) {
	return (
		<PageLayout>
			<div className="flex flex-col gap-4">
				{children}
			</div>
		</PageLayout>
	);
}

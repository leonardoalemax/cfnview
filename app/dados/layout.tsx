import PageLayout from "../../components/ui/PageLayout";
import DadosNav from "../../components/DadosNav";

export default function DadosLayout({ children }: { children: React.ReactNode }) {
	return (
		<PageLayout>
			<div className="flex flex-col gap-4">
				<DadosNav />
				{children}
			</div>
		</PageLayout>
	);
}

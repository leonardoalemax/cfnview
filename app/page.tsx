import PageLayout from "../components/ui/PageLayout";
import PlayerSearch from "../components/PlayerSearch";

export default function Home() {
	return (
		<PageLayout>
			<div className="flex flex-col items-center justify-center min-h-[80vh]">
				<div className="w-full max-w-md flex flex-col items-center gap-6">
					<h1 className="text-3xl font-bold">cfnview</h1>
					<p className="text-base-content/60 text-center">
						Busque pelo Fighter ID para ver suas batalhas
					</p>
					<PlayerSearch />
				</div>
			</div>
		</PageLayout>
	);
}

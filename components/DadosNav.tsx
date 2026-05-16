"use client";

import { usePathname } from "next/navigation";
import { Tab, TabList } from "./ui/Tabs";

export default function DadosNav() {
	const pathname = usePathname();
	const isUsage = pathname.startsWith("/dados/usage");
	const isMatchups = pathname.startsWith("/dados/matchups");
	const isMap = pathname.startsWith("/dados/map");

	return (
		<TabList>
			<Tab active={isUsage} href="/dados/usage">Uso de Boneco</Tab>
			<Tab active={isMatchups} href="/dados/matchups">Matchups</Tab>
			<Tab active={isMap} href="/dados/map">Mapa</Tab>
		</TabList>
	);
}

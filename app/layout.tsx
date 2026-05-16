import type { Metadata } from "next";
import "../styles/globals.css";
import AppHeader from "../components/ui/AppHeader";
import BottomNav from "../components/ui/BottomNav";

export const metadata: Metadata = {
	title: "street fighter 6 · zerei.club",
	description: "Street Fighter 6 battle log viewer",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='pt-BR' data-theme='dark'>
			<body>
				<AppHeader />
				{/* espaçador superior para compensar o header fixo (h-14 = 3.5rem) */}
				<div className='h-14' aria-hidden='true' />
				{children}
				{/* espaçador inferior só em mobile, para compensar a bottom nav flutuante */}
				<div className='h-20 sm:hidden' aria-hidden='true' />
				<BottomNav />
			</body>
		</html>
	);
}

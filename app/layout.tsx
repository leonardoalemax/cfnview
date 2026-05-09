import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
	title: "cfnview",
	description: "Street Fighter 6 battle log viewer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" data-theme="dark">
			<body>{children}</body>
		</html>
	);
}

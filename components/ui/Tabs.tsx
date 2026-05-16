import clsx from "clsx";
import Link from "next/link";
import React from "react";

// ---------------------------------------------------------------------------
// TabList — container de tabs (tabs tabs-box do DaisyUI)
// ---------------------------------------------------------------------------
interface TabListProps {
	children: React.ReactNode;
	className?: string;
	/** Mantida por compatibilidade — sem efeito (os tabs sempre wrapam agora) */
	scrollable?: boolean;
}

export function TabList({ children, className = "" }: TabListProps) {
	return (
		<div
			role='tablist'
			className={clsx(
				"tabs tabs-box backdrop-blur sf6-panel flex-wrap",
				className,
			)}>
			{children}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Tab — item individual
//   • href  → renderiza <Link> dentro do tab
//   • onClick → renderiza <button>
// ---------------------------------------------------------------------------
interface TabProps {
	active: boolean;
	children: React.ReactNode;
	className?: string;
	href?: string;
	onClick?: () => void;
}

export function Tab({
	active,
	children,
	className = "",
	href,
	onClick,
}: TabProps) {
	const cls = clsx(
		"tab gap-2 px-4 transition-all",
		active && "tab-active sf6-panel font-semibold",
		className,
	);

	if (href) {
		return (
			<Link role='tab' href={href} className={cls}>
				{children}
			</Link>
		);
	}

	return (
		<button role='tab' type='button' className={cls} onClick={onClick}>
			{children}
		</button>
	);
}

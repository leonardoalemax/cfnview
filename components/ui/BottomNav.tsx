"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function IconChart({ className }: { className?: string }) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
			className={className}>
			<line x1='18' y1='20' x2='18' y2='10' />
			<line x1='12' y1='20' x2='12' y2='4' />
			<line x1='6' y1='20' x2='6' y2='14' />
		</svg>
	);
}

function IconUser({ className }: { className?: string }) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
			className={className}>
			<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
			<circle cx='12' cy='7' r='4' />
		</svg>
	);
}

interface NavItemProps {
	href: string;
	active: boolean;
	disabled?: boolean;
	icon: React.ReactNode;
	label: string;
}

function NavItem({ href, active, disabled, icon, label }: NavItemProps) {
	const cls = clsx(
		"flex flex-col items-center h-auto w-auto justify-center gap-0.5 flex-1 text-[8px] transition-all sf6-panel",
		active && "active",
		!active && !disabled && "text-base-content/60 hover:text-base-content",
		disabled && "text-base-content/25 cursor-not-allowed",
	);

	if (disabled) {
		return (
			<span className={cls}>
				{icon}
				<span>{label}</span>
			</span>
		);
	}

	return (
		<Link href={href} className={cls}>
			{icon}
			<span>{label}</span>
		</Link>
	);
}

export default function BottomNav() {
	const pathname = usePathname();
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		setUserId(localStorage.getItem("cfnview_user_id"));
	}, []);

	const isDados =
		pathname.startsWith("/dados") ||
		pathname.startsWith("/usage") ||
		pathname.startsWith("/fighting");
	const isStats = pathname.startsWith("/battlelog");

	return (
		<nav
			className='fixed bottom-4 left-6 right-6 z-50 sm:hidden flex h-12 p-2 gap-2 backdrop-blur-xl sf6-bar shadow-2xl shadow-black/40'
			role='navigation'>
			<NavItem
				href='/dados'
				active={isDados}
				icon={<IconChart className='w-2 h-2' />}
				label='Dados'
			/>
			<NavItem
				href={userId ? `/battlelog/${userId}/stats` : "#"}
				active={isStats}
				disabled={!userId}
				icon={<IconUser className='w-2 h-2' />}
				label='Stats'
			/>
		</nav>
	);
}

"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CharacterIcon from "./CharacterIcon";
const API_BASE = process.env.NEXT_PUBLIC_GO_API_URL ?? "";

interface Profile {
	name: string;
	characterToolName: string;
}

function blurActive() {
	(document.activeElement as HTMLElement)?.blur();
}

function IconMenu({ className }: { className?: string }) {
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
			<line x1='3' y1='6' x2='21' y2='6' />
			<line x1='3' y1='12' x2='21' y2='12' />
			<line x1='3' y1='18' x2='21' y2='18' />
		</svg>
	);
}

function IconClose({ className }: { className?: string }) {
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
			<line x1='18' y1='6' x2='6' y2='18' />
			<line x1='6' y1='6' x2='18' y2='18' />
		</svg>
	);
}

export default function AppHeader() {
	const pathname = usePathname();
	const [userId, setUserId] = useState<string | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	useEffect(() => {
		const id = localStorage.getItem("cfnview_user_id");
		if (!id) return;
		setUserId(id);
		fetch(`${API_BASE}/v1/battlelog/${id}/profile`)
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (data) {
					setProfile({
						name: data.personal_info?.fighter_id ?? id,
						characterToolName:
							data.favorite_character_tool_name ?? "",
					});
				}
			})
			.catch(() => {});
	}, []);

	// Fecha o drawer quando a rota muda
	useEffect(() => {
		setDrawerOpen(false);
	}, [pathname]);

	function logout() {
		localStorage.removeItem("cfnview_user_id");
		setUserId(null);
		setProfile(null);
	}

	const hasAvatar = !!profile?.characterToolName;

	const isDados =
		pathname.startsWith("/dados") ||
		pathname.startsWith("/usage") ||
		pathname.startsWith("/fighting");
	const isStats = pathname.startsWith("/battlelog");

	const dadosLinks = [
		{ href: "/dados/usage", label: "Uso de Boneco" },
		{ href: "/dados/matchups", label: "Matchups" },
	];
	const profileLinks = userId
		? [
				{ href: `/battlelog/${userId}/stats`, label: "Stats" },
				{
					href: `/battlelog/${userId}/opponents`,
					label: "Adversários",
				},
				{ href: `/battlelog/${userId}/history`, label: "Histórico" },
			]
		: [];

	return (
		<>
			<header className='navbar fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur border-b border-base-300 px-4 min-h-14 h-14'>
				{/* Hamburger (só mobile) */}
				<button
					type='button'
					className='btn btn-ghost btn-sm sm:hidden mr-2'
					onClick={() => setDrawerOpen(true)}
					aria-label='Abrir menu'>
					<IconMenu className='w-5 h-5' />
				</button>

				{/* Logo */}
				<div className='navbar-start'>
					<Link href='/' className='flex flex-col leading-tight'>
						<span className='text-[10px] text-base-content/50 font-medium tracking-wide'>
							street fighter 6
						</span>
						<span className='text-sm font-bold text-primary leading-tight'>
							zerei.club
						</span>
					</Link>
				</div>

				{/* Nav central — só desktop */}
				<nav className='navbar-center hidden sm:flex gap-1'>
					{/* Dados dropdown */}
					<div className='dropdown dropdown-end'>
						<div
							tabIndex={0}
							role='button'
							className={clsx(
								"btn btn-sm",
								isDados ? "active" : "disabled",
							)}>
							Dados Globais
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content menu bg-base-100 rounded-box shadow z-50 w-44 mt-2'>
							{dadosLinks.map((l) => (
								<li key={l.href}>
									<Link href={l.href} onClick={blurActive}>
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Profile dropdown */}
					{userId ? (
						<div className='dropdown dropdown-end'>
							<div
								tabIndex={0}
								role='button'
								className={clsx(
									"btn btn-sm",
									isStats ? "active" : "disabled",
								)}>
								Profile
							</div>
							<ul
								tabIndex={0}
								className='dropdown-content menu bg-base-100 rounded-box shadow z-50 w-44 mt-2'>
								{profileLinks.map((l) => (
									<li key={l.href}>
										<Link
											href={l.href}
											onClick={blurActive}>
											{l.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					) : (
						<span
							className='btn btn-sm btn-ghost opacity-40 cursor-not-allowed'
							title='Faça login para acessar'>
							Profile
						</span>
					)}
				</nav>

				{/* User area */}
				<div className='navbar-end'>
					{!userId ? (
						<Link href='/' className='btn btn-sm btn-outline'>
							Entrar
						</Link>
					) : (
						<div className='dropdown dropdown-end'>
							<div
								tabIndex={0}
								role='button'
								className='btn btn-ghost btn-sm gap-2 max-w-48'>
								{hasAvatar ? (
									<CharacterIcon
										toolName={profile!.characterToolName}
										className='w-6 h-6 object-bottom'
									/>
								) : (
									<div className='w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold'>
										{(profile?.name ?? userId)
											.charAt(0)
											.toUpperCase()}
									</div>
								)}
								<span className='max-w-28 truncate text-sm hidden sm:inline'>
									{profile?.name ?? userId}
								</span>
							</div>
							<ul
								tabIndex={0}
								className='dropdown-content menu bg-base-100 rounded-box shadow z-50 w-36 mt-2'>
								<li>
									<Link
										href={`/battlelog/${userId}/stats`}
										onClick={blurActive}>
										Meu perfil
									</Link>
								</li>
								<li>
									<button
										onClick={logout}
										className='text-error'>
										Sair
									</button>
								</li>
							</ul>
						</div>
					)}
				</div>
			</header>

			{/* ─── Drawer lateral (mobile) ──────────────────────────────────── */}
			{/* Backdrop */}
			<div
				className={clsx(
					"fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity sm:hidden",
					drawerOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none",
				)}
				onClick={() => setDrawerOpen(false)}
				aria-hidden='true'
			/>
			{/* Panel */}
			<aside
				className={clsx(
					"fixed top-0 bottom-0 left-0 z-[70] w-72 max-w-[85vw] bg-base-100 border-r border-base-300 shadow-xl transition-transform sm:hidden flex flex-col",
					drawerOpen ? "translate-x-0" : "-translate-x-full",
				)}
				aria-hidden={!drawerOpen}>
				<div className='flex items-center justify-between px-4 h-14 border-b border-base-300'>
					<span className='text-sm font-bold text-primary'>
						zerei.club
					</span>
					<button
						type='button'
						className='btn btn-ghost btn-sm'
						onClick={() => setDrawerOpen(false)}
						aria-label='Fechar menu'>
						<IconClose className='w-5 h-5' />
					</button>
				</div>

				<nav className='flex-1 overflow-y-auto p-2'>
					<div className='text-[10px] uppercase tracking-wider text-base-content/40 px-3 pt-3 pb-1'>
						Dados
					</div>
					<ul className='menu w-full'>
						{dadosLinks.map((l) => (
							<li key={l.href}>
								<Link href={l.href}>{l.label}</Link>
							</li>
						))}
					</ul>

					{userId && (
						<>
							<div className='text-[10px] uppercase tracking-wider text-base-content/40 px-3 pt-4 pb-1'>
								Profile
							</div>
							<ul className='menu w-full'>
								{profileLinks.map((l) => (
									<li key={l.href}>
										<Link href={l.href}>{l.label}</Link>
									</li>
								))}
							</ul>
						</>
					)}
				</nav>

				{userId && (
					<div className='p-3 border-t border-base-300'>
						<button
							onClick={() => {
								logout();
								setDrawerOpen(false);
							}}
							className='btn btn-sm btn-outline btn-error w-full'>
							Sair
						</button>
					</div>
				)}
			</aside>
		</>
	);
}

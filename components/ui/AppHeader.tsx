"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";
const API_BASE = process.env.NEXT_PUBLIC_GO_API_URL ?? "";

interface Profile {
	name: string;
	characterToolName: string;
}

export default function AppHeader() {
	const pathname = usePathname();
	const [userId, setUserId] = useState<string | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);

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

	function logout() {
		localStorage.removeItem("cfnview_user_id");
		setUserId(null);
		setProfile(null);
	}

	const avatarSrc = profile?.characterToolName
		? `${SF6_BASE}/material/character/character_${profile.characterToolName}_l.png`
		: null;

	const isDados =
		pathname.startsWith("/dados") ||
		pathname.startsWith("/usage") ||
		pathname.startsWith("/fighting");
	const isStats = pathname.startsWith("/battlelog");

	return (
		<header className='navbar fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur border-b border-base-300 px-4 min-h-14 h-14'>
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

			{/* Nav central — escondida em mobile (vira bottom nav) */}
			<nav className='navbar-center hidden sm:flex gap-1'>
				<Link
					href='/dados'
					className={clsx(
						"btn btn-sm sf6-panel",
						isDados ? "active" : "disabled",
					)}>
					Dados
				</Link>

				{userId ? (
					<Link
						href={`/battlelog/${userId}/stats`}
						className={clsx(
							"btn btn-sm sf6-panel",
							isStats ? "active" : "disabled",
						)}>
						Stats
					</Link>
				) : (
					<span
						className='btn btn-sm btn-ghost opacity-40 cursor-not-allowed'
						title='Faça login para acessar'>
						Stats
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
							{avatarSrc ? (
								<img
									src={avatarSrc}
									alt={profile?.characterToolName}
									className='w-7 h-7 object-contain rounded-full bg-base-300'
								/>
							) : (
								<div className='w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold'>
									{(profile?.name ?? userId)
										.charAt(0)
										.toUpperCase()}
								</div>
							)}
							<span className='max-w-28 truncate text-sm'>
								{profile?.name ?? userId}
							</span>
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content menu bg-base-100 rounded-box shadow z-50 w-36 mt-2'>
							<li>
								<Link href={`/battlelog/${userId}/stats`}>
									Meu perfil
								</Link>
							</li>
							<li>
								<button onClick={logout} className='text-error'>
									Sair
								</button>
							</li>
						</ul>
					</div>
				)}
			</div>
		</header>
	);
}

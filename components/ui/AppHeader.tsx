"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CharacterIcon from "./CharacterIcon";
const API_BASE = process.env.NEXT_PUBLIC_GO_API_URL ?? "";

interface Profile {
	name: string;
	characterToolName: string;
}

export default function AppHeader() {
	const router = useRouter();
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
		router.push("/");
	}

	const hasAvatar = !!profile?.characterToolName;

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

			{/* User area */}
			<div className='navbar-end'>
				{!userId ? (
					<Link href='/' className='btn btn-sm btn-outline'>
						Entrar
					</Link>
				) : (
					<div className='flex items-center gap-2'>
						<Link
							href={`/battlelog/${userId}/stats`}
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
						</Link>
						<button
							onClick={logout}
							className='btn btn-ghost btn-sm btn-square text-error'
							title='Sair'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth={2}
								strokeLinecap='round'
								strokeLinejoin='round'
								className='w-4 h-4'>
								<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
								<polyline points='16 17 21 12 16 7' />
								<line x1='21' y1='12' x2='9' y2='12' />
							</svg>
						</button>
					</div>
				)}
			</div>
		</header>
	);
}

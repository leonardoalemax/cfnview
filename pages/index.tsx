import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
	const [userId, setUserId] = useState("");
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		router.push(`/battlelog/${userId}/stats`);
	};

	return (
		<main className='flex min-h-screen flex-col items-center justify-center p-24'>
			<div className='w-full max-w-md'>
				<h1 className='text-3xl font-bold text-center mb-8'>cfnview</h1>
				<p className='text-center mb-6'>
					Insira seu ID do Street Fighter para ver suas batalhas
				</p>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<input
						type='text'
						placeholder='ID do usuário (ex: 3378249682)'
						value={userId}
						onChange={(e) => setUserId(e.target.value)}
						className='input input-bordered w-full'
						required
					/>
					<button type='submit' className='btn btn-primary w-full'>
						Ver Batalhas
					</button>
				</form>
			</div>
		</main>
	);
}

import { redirect } from "next/navigation";

interface Props {
	params: Promise<{ userId: string }>;
}

export default async function BattlelogIndex({ params }: Props) {
	const { userId } = await params;
	redirect(`/battlelog/${userId}/stats`);
}

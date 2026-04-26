import type { GetServerSideProps } from "next";

export default function BattlelogIndex() {
	return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const userId = String(params?.userId ?? "");
	return {
		redirect: {
			destination: `/battlelog/${userId}/stats`,
			permanent: false,
		},
	};
};

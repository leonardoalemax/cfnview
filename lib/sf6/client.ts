import type { SF6BattlelogResponse, SF6FighterBannerInfo, SF6Replay } from "../types";

const SF6_URL = (userId: string, page: number) =>
	`https://www.streetfighter.com/6/buckler/_next/data/FxMUIoPtSKOc3agoNJLwS/en/profile/${userId}/battlelog.json?page=${page}&sid=${userId}`;

const FETCH_HEADERS = {
	accept: "*/*",
	"accept-language": "en-US,en;q=0.9",
	referer: "https://www.streetfighter.com/6/buckler/",
	"sec-fetch-dest": "empty",
	"sec-fetch-mode": "cors",
	"sec-fetch-site": "same-origin",
	"user-agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
	"x-nextjs-data": "1",
	Cookie: process.env.SF6_COOKIE ?? "",
};

async function fetchPage(userId: string, page: number): Promise<SF6BattlelogResponse> {
	const res = await fetch(SF6_URL(userId, page), { headers: FETCH_HEADERS });
	if (!res.ok) throw new Error(`SF6 page ${page} returned ${res.status}`);
	return res.json();
}

export interface FirstPageResult {
	page1Replays: SF6Replay[];
	totalPages: number;
	bannerInfo: SF6FighterBannerInfo | undefined;
}

export async function fetchFirstPage(userId: string): Promise<FirstPageResult> {
	const first = await fetchPage(userId, 1);
	return {
		page1Replays: first?.pageProps?.replay_list ?? [],
		totalPages: first?.pageProps?.total_page ?? 1,
		bannerInfo: first?.pageProps?.fighter_banner_info,
	};
}

export async function fetchRemainingPages(userId: string, totalPages: number): Promise<SF6Replay[]> {
	if (totalPages <= 1) return [];
	const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
	const results = await Promise.all(pages.map((p) => fetchPage(userId, p)));
	return results.flatMap((r) => r?.pageProps?.replay_list ?? []);
}

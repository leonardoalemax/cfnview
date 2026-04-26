import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { CachedBattlelog, SF6BattlelogResponse, SF6FighterBannerInfo, SF6Replay } from "./types";

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
	Cookie: "CookieConsent={stamp:%27PRS9hN/LKwSccgCOcCiOjbaLVUGP4HlQOeZLu/qo1kQzGJ1sf0zkFA==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:3%2Cutc:1777207741607%2Cregion:%27br%27}; buckler_id=lG1A0YpNoOFhHPCEQfxA4hwQmuZTJ1yUGLAwsV5dUZg8BHOscQAe66HTQtW8tfEH; buckler_r_id=cdf81778-1811-4ce6-b6a3-c3ecc5ee4924;",
};

async function fetchPage(userId: string, page: number): Promise<SF6BattlelogResponse> {
	const res = await fetch(SF6_URL(userId, page), { headers: FETCH_HEADERS });
	if (!res.ok) throw new Error(`SF6 page ${page} returned ${res.status}`);
	return res.json();
}

async function fetchAllPages(userId: string): Promise<{
	replays: SF6Replay[];
	bannerInfo: SF6FighterBannerInfo | undefined;
}> {
	const first = await fetchPage(userId, 1);
	const totalPages = first?.pageProps?.total_page ?? 1;
	const replays: SF6Replay[] = [...(first?.pageProps?.replay_list ?? [])];
	const bannerInfo = first?.pageProps?.fighter_banner_info;

	if (totalPages > 1) {
		const rest = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
		const pages = await Promise.all(rest.map((p) => fetchPage(userId, p)));
		for (const page of pages) {
			replays.push(...(page?.pageProps?.replay_list ?? []));
		}
	}

	return { replays, bannerInfo };
}

export async function getBattlelog(
	userId: string,
	resync = false,
): Promise<CachedBattlelog> {
	const docRef = doc(db, "users", userId);

	if (!resync) {
		try {
			const snap = await getDoc(docRef);
			if (snap.exists()) {
				const cached = snap.data() as CachedBattlelog;
				if (cached.replays?.length) return cached;
			}
		} catch (e) {
			console.error("Firebase read error:", e);
		}
	}

	// Read existing cached replays before overwriting
	let existingReplays: SF6Replay[] = [];
	try {
		const snap = await getDoc(docRef);
		if (snap.exists()) {
			existingReplays = (snap.data() as CachedBattlelog).replays ?? [];
		}
	} catch (e) {
		console.error("Firebase read error:", e);
	}

	const { replays: freshReplays, bannerInfo } = await fetchAllPages(userId);

	// Merge: fresh replays take precedence, old ones fill in anything not present
	const merged = new Map<string, SF6Replay>();
	for (const r of existingReplays) merged.set(r.replay_id, r);
	for (const r of freshReplays) merged.set(r.replay_id, r);

	const replays = Array.from(merged.values()).sort(
		(a, b) => b.uploaded_at - a.uploaded_at,
	);

	const payload: CachedBattlelog = { replays, cachedAt: Date.now(), bannerInfo };

	try {
		await setDoc(docRef, payload);
	} catch (e) {
		console.error("Firebase write error:", e);
	}

	return payload;
}

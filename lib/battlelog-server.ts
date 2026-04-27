import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type {
	CachedBattlelog,
	SF6BattlelogResponse,
	SF6FighterBannerInfo,
	SF6Replay,
} from "./types";

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
	Cookie: "CookieConsent={stamp:%27PRS9hN/LKwSccgCOcCiOjbaLVUGP4HlQOeZLu/qo1kQzGJ1sf0zkFA==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:3%2Cutc:1777207741607%2Cregion:%27br%27}; _gcl_au=1.1.763341075.1777207742; buckler_r_id=cdf81778-1811-4ce6-b6a3-c3ecc5ee4924; _ga_B8S45G09HL=GS2.1.s1777207794$o1$g0$t1777207796$j58$l0$h0; _twpid=tw.1777207796660.749180033342537378; __td_signed=true; _tt_enable_cookie=1; _ttp=01KQ4XDS40H3PSGM4CDEM8MY59_.tt.1; _fbp=fb.1.1777207796978.174411040348051798; _gsid=09e63a7c37164dd597efc802c3f05982; ttcsid=1777207796866::CPOvsJVhJxw0-2IrbQTL.1.1777207801054.0::1.-5775.7::4180.1.1120.233::0.0.0; ttcsid_CHA9T3JC77UDT6H4QD40=1777207796866::TxlfQNZUsX0o9R_nmkVy.1.1777207801054.0; _td=2d2fa900-4e52-43b4-859a-7bd8f42eab45; _ga=GA1.1.1503539287.1777207730; buckler_praise_date=1777312477834; buckler_id=mx_iiCZ5ap2mTbwpwlKWs0uF29iiOlcLsXENbLCbiAqLs85wbYtRf1I3fBfwaOVZ; _ga_4BKH6S3JTF=GS2.1.s1777312476$o4$g1$t1777312619$j60$l0$h0; _ga_LZJGXR1W9E=GS2.1.s1777312476$o4$g1$t1777312619$j60$l0$h0;",
};

async function fetchPage(
	userId: string,
	page: number,
): Promise<SF6BattlelogResponse> {
	const res = await fetch(SF6_URL(userId, page), { headers: FETCH_HEADERS });
	if (!res.ok) throw new Error(`SF6 page ${page} returned ${res.status}`);
	return res.json();
}

export async function getBattlelog(userId: string): Promise<CachedBattlelog> {
	const docRef = doc(db, "users", userId);

	// Load cache — needed to diff and to accumulate historical replays
	let existingReplays: SF6Replay[] = [];
	let cached: CachedBattlelog | null = null;
	try {
		const snap = await getDoc(docRef);
		if (snap.exists()) {
			cached = snap.data() as CachedBattlelog;
			existingReplays = cached.replays ?? [];
		}
	} catch (e) {
		console.error("Firebase read error:", e);
	}

	// Always fetch page 1 to check for new replays
	const first = await fetchPage(userId, 1);
	const totalPages = first?.pageProps?.total_page ?? 1;
	const page1Replays: SF6Replay[] = first?.pageProps?.replay_list ?? [];
	const bannerInfo = first?.pageProps?.fighter_banner_info;

	// If page 1 has no new replays, return cache unchanged
	const cachedIds = new Set(existingReplays.map((r) => r.replay_id));
	const hasNewReplays = page1Replays.some((r) => !cachedIds.has(r.replay_id));

	if (!hasNewReplays && existingReplays.length) {
		console.log(
			`[battlelog] No new replays for ${userId}, skipping remaining pages.`,
		);
		return cached!;
	}

	// New replays detected — fetch remaining pages in parallel
	const freshReplays: SF6Replay[] = [...page1Replays];
	if (totalPages > 1) {
		const rest = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
		const pages = await Promise.all(rest.map((p) => fetchPage(userId, p)));
		for (const page of pages) {
			freshReplays.push(...(page?.pageProps?.replay_list ?? []));
		}
	}

	// Merge: fresh replays take precedence, old ones fill in anything not present
	const merged = new Map<string, SF6Replay>();
	for (const r of existingReplays) merged.set(r.replay_id, r);
	for (const r of freshReplays) merged.set(r.replay_id, r);

	const replays = Array.from(merged.values()).sort(
		(a, b) => b.uploaded_at - a.uploaded_at,
	);

	const payload: CachedBattlelog = {
		replays,
		cachedAt: Date.now(),
		bannerInfo,
	};

	try {
		await setDoc(docRef, payload);
	} catch (e) {
		console.error("Firebase write error:", e);
	}

	return payload;
}

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { NextApiRequest, NextApiResponse } from "next";
import type { CachedBattlelog, SF6BattlelogResponse, SF6Replay } from "../../lib/types";

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

async function fetchAllReplays(userId: string): Promise<SF6Replay[]> {
	// Fetch page 1 first to discover total_page
	const first = await fetchPage(userId, 1);
	const totalPages = first?.pageProps?.total_page ?? 1;
	const replays: SF6Replay[] = [...(first?.pageProps?.replay_list ?? [])];

	if (totalPages > 1) {
		const remaining = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
		const pages = await Promise.all(remaining.map((p) => fetchPage(userId, p)));
		for (const page of pages) {
			replays.push(...(page?.pageProps?.replay_list ?? []));
		}
	}

	return replays;
}

export type BattlelogApiResponse = CachedBattlelog | { error: string };

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<BattlelogApiResponse>,
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { userId, resync } = req.query;

	if (!userId || typeof userId !== "string") {
		return res.status(400).json({ error: "userId required" });
	}

	const docRef = doc(db, "users", userId);

	if (resync !== "true") {
		try {
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const cached = docSnap.data() as CachedBattlelog;
				if (cached.replays?.length) {
					return res.status(200).json(cached);
				}
			}
		} catch (e) {
			console.error("Firebase read error:", e);
		}
	}

	try {
		const replays = await fetchAllReplays(userId);
		const payload: CachedBattlelog = { replays, cachedAt: Date.now() };

		try {
			await setDoc(docRef, payload);
		} catch (e) {
			console.error("Firebase write error:", e);
		}

		return res.status(200).json(payload);
	} catch (error) {
		console.error("Fetch error:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

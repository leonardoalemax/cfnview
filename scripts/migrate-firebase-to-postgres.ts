/**
 * One-time migration: Firebase Firestore → Postgres
 *
 * Usage:
 *   npx tsx scripts/migrate-firebase-to-postgres.ts
 *
 * Requirements:
 *   - .env.local must have both NEXT_PUBLIC_FIREBASE_* and DATABASE_URL set
 *   - Postgres table must already exist:
 *       CREATE TABLE user_battlelog (
 *         user_id     TEXT PRIMARY KEY,
 *         replays     JSONB   NOT NULL DEFAULT '[]',
 *         banner_info JSONB,
 *         cached_at   BIGINT  NOT NULL
 *       );
 */

// dotenv MUST run before any lib import — otherwise DATABASE_URL is undefined
// when lib/db.ts initializes the postgres() connection
import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import type { CachedBattlelog } from "../lib/types";

async function migrate() {
	// Dynamic import so lib/db.ts (and postgres()) only runs AFTER dotenv loaded above
	const { getCached, saveCached } = await import("../lib/repositories/battlelog-repository");

	const app = initializeApp({
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	});
	const db = getFirestore(app);

	console.log("🔍 Lendo todos os usuários do Firebase...");
	const snapshot = await getDocs(collection(db, "users"));

	if (snapshot.empty) {
		console.log("⚠️  Nenhum documento encontrado no Firebase.");
		return;
	}

	console.log(`📦 ${snapshot.size} usuário(s) encontrado(s). Iniciando migração...\n`);

	let ok = 0;
	let skipped = 0;
	let failed = 0;

	for (const docSnap of snapshot.docs) {
		const userId = docSnap.id;
		const data = docSnap.data() as CachedBattlelog;

		if (!data.replays?.length) {
			console.log(`  ⏭️  ${userId} — sem replays, ignorando.`);
			skipped++;
			continue;
		}

		try {
			const existing = await getCached(userId);
			if (existing && existing.cachedAt >= data.cachedAt) {
				console.log(`  ✅  ${userId} — Postgres já está atualizado (${existing.replays.length} replays), pulando.`);
				skipped++;
				continue;
			}

			await saveCached(userId, data);
			console.log(`  ✅  ${userId} — ${data.replays.length} replays migrados.`);
			ok++;
		} catch (err) {
			console.error(`  ❌  ${userId} — erro:`, err);
			failed++;
		}
	}

	console.log(`\n📊 Resultado: ${ok} migrados, ${skipped} ignorados, ${failed} com erro.`);
	process.exit(failed > 0 ? 1 : 0);
}

migrate().catch((err) => {
	console.error("Erro fatal:", err);
	process.exit(1);
});

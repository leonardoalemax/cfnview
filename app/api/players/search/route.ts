import { NextResponse } from "next/server";

const BASE = process.env.GO_API_URL;

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const q = searchParams.get("q") ?? "";
	const res = await fetch(`${BASE}/v1/players/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

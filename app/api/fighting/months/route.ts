import { NextResponse } from "next/server";

const BASE = process.env.GO_API_URL;

export async function GET() {
	const res = await fetch(`${BASE}/v1/fighting/months`, { cache: "no-store" });
	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

import { NextResponse } from "next/server";

const BASE = process.env.GO_API_URL;

export async function GET(_req: Request, { params }: { params: Promise<{ yyyymm: string }> }) {
	const { yyyymm } = await params;
	const res = await fetch(`${BASE}/v1/fighting/${yyyymm}`, { cache: "no-store" });
	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

export async function POST(_req: Request, { params }: { params: Promise<{ yyyymm: string }> }) {
	const { yyyymm } = await params;
	const res = await fetch(`${BASE}/v1/fighting/${yyyymm}/sync`, {
		method: "POST",
		cache: "no-store",
	});
	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

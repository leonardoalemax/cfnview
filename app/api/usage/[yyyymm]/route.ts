import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.GO_API_URL;

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ yyyymm: string }> },
) {
	const { yyyymm } = await params;
	const res = await fetch(`${BASE}/v1/usage/${yyyymm}`, { cache: "no-store" });
	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

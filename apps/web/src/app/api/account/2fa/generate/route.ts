import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:4000/api";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    const response = await fetch(`${BACKEND_API_URL}/auth/2fa/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: (data as any)?.message || "Failed to generate 2FA secret" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("2FA generate proxy error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

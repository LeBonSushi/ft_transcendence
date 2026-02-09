import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Créer un nouveau FormData pour l'envoi au backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    // Upload via le backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storage/upload/avatar/${session.user.id}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.user.id}`,
        },
        body: backendFormData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Upload failed" },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

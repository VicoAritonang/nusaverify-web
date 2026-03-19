import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, context, image } = body as {
      id: string;
      context: string;
      image?: string; // base64
    };

    const webhookUrl = process.env.MAIN_AGENT_WEBHOOK_URL;
    const apiKey = process.env.X_API_KEY;

    if (!webhookUrl || !apiKey) {
      return NextResponse.json(
        { status: "failed", error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const payload: Record<string, unknown> = { id, context };
    if (image) {
      payload.image = image;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "failed", error: "Backend error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: "failed", error: "Internal server error" },
      { status: 500 }
    );
  }
}

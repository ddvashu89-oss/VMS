import { NextResponse } from "next/server";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyUDXh2MBr5paT3daIjvw5TTf6UvLtrVijQMVwwQexEXdcDMiKbwqYCEybKJhKcgcE6/exec";

// ─── GET — list all operators ────────────────────────────────────────────────
export async function GET() {
  try {
    const response = await fetch(`${SCRIPT_URL}?sheet=Operators`, {
      cache: "no-store",
    });
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Invalid response from Apps Script for operators.");
    }
    return NextResponse.json(Array.isArray(json) ? json : json.data ?? []);
  } catch (error: any) {
    console.error("Operators GET Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch operators from Google Sheets." },
      { status: 500 }
    );
  }
}

// ─── POST — add a new operator ───────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Operator name is required." },
        { status: 400 }
      );
    }

    const payload = {
      action: "addOperator",
      sheet: "Operators",
      name: name.trim(),
      phone: (phone ?? "").trim(),
      email: (email ?? "").trim(),
      createdAt: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        "Invalid response from Apps Script. Make sure it is deployed as 'Anyone'."
      );
    }

    if (json.error) throw new Error(json.error);

    return NextResponse.json({ success: true, data: json });
  } catch (error: any) {
    console.error("Operators POST Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to add operator." },
      { status: 500 }
    );
  }
}

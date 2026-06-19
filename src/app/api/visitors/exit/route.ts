import { NextResponse } from "next/server";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUDXh2MBr5paT3daIjvw5TTf6UvLtrVijQMVwwQexEXdcDMiKbwqYCEybKJhKcgcE6/exec";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    console.log('Received exit request for id:', id);
    if (!id) {
      return NextResponse.json({ error: "Visitor ID missing" }, { status: 400 });
    }

    const exitTime = "'" + new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });

    // Send the exit command to the Apps Script Web App
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        id: id,
        action: "exit",
        status: "Exited",
        exitTime: exitTime,
      }),
    });

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid response from Apps Script. Make sure it is deployed as 'Anyone'.");
    }

    if (json.error) {
      throw new Error(json.error);
    }

    return NextResponse.json({ data: json });
  } catch (error: any) {
    console.error("Visitor exit API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark visitor exit" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUDXh2MBr5paT3daIjvw5TTf6UvLtrVijQMVwwQexEXdcDMiKbwqYCEybKJhKcgcE6/exec";

export async function GET() {
  try {
    const response = await fetch(SCRIPT_URL, { cache: "no-store" });
    
    // We get the text first to avoid JSON parsing errors if Apps Script returns HTML
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch(e) {
      throw new Error("Invalid response from Apps Script. Make sure it is deployed as 'Anyone'.");
    }
    
    return NextResponse.json(json);
  } catch (error: any) {
    console.error("Apps Script API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data from Google Sheets." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let visitorId = body.id || "";
    if (!visitorId && body.phone) {
      try {
        const getRes = await fetch(SCRIPT_URL, { cache: "no-store" });
        const text = await getRes.text();
        const json = JSON.parse(text);
        const list = Array.isArray(json) ? json : (json.data || []);
        const cleanPhone = body.phone.replace(/\s+/g, "").replace(/^\+91/, "");
        const match = list.find((v: any) => {
          const vPhone = (v.phone || "").replace(/\s+/g, "").replace(/^\+91/, "");
          return vPhone && vPhone === cleanPhone;
        });
        if (match) {
          visitorId = match.id;
        }
      } catch (e) {
        console.error("Backend phone matching fallback error:", e);
      }
    }

    const enrichedBody = {
      ...body,
      id: visitorId,
      enteredBy: body.enteredBy,
      createdAt: body.createdAt || new Date().toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }),
      entryTime: body.entryTime ? ("'" + body.entryTime.replace(/^'/, "")) : ("'" + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })),
      exitTime: body.exitTime || "",
      status: body.status || "Inside",
    };
    
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(enrichedBody),
    });

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch(e) {
      throw new Error("Invalid response from Apps Script. Make sure it is deployed as 'Anyone'.");
    }
    
    return NextResponse.json(json);
  } catch (error: any) {
    console.error("Apps Script API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to append data to Google Sheets." },
      { status: 500 }
    );
  }
}

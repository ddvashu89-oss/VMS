import { google } from "googleapis";

// Configure this in .env.local
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

export async function getSheets() {
  if (!SPREADSHEET_ID) {
    throw new Error("Missing SPREADSHEET_ID in environment variables.");
  }

  let auth;

  // Prefer Service Account credentials if available
  if (CLIENT_EMAIL && PRIVATE_KEY) {
    console.log('🔐 Using Service Account authentication for Google Sheets');
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } else if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
    console.log('🔐 Using OAuth2 authentication for Google Sheets');
    auth = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  } else {
    throw new Error("Missing Google Sheets authentication credentials in environment variables.");
  }

  const sheets = google.sheets({ version: "v4", auth });

  return { sheets, spreadsheetId: SPREADSHEET_ID };
}

export async function getVisitors() {
  try {
    const { sheets, spreadsheetId } = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Visitors!A:J",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // Skip header row
    const visitors = rows.slice(1).map((row) => ({
      id: row[0],
      name: row[1],
      phone: row[2],
      purpose: row[3],
      personToMeet: row[4],
      vehicleNumber: row[5],
      entryTime: row[6],
      exitTime: row[7],
      status: row[8],
      createdAt: row[9],
    }));

    return visitors;
  } catch (error) {
    console.error("Error fetching visitors from Google Sheets:", error);
    throw error;
  }
}

export async function addVisitorRow(data: any) {
  try {
    const { sheets, spreadsheetId } = await getSheets();

    // Create new row using a short PARVIS ID
    const id = "PARVIS-" + Math.floor(1000 + Math.random() * 9000);
    const createdAt = "'" + new Date().toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    const entryTime = "'" + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const row = [
      id,
      data.fullName,
      data.phone,
      data.purpose,
      data.personToMeet,
      data.vehicleNumber || "-",
      entryTime,
      "", // Exit time
      "Inside",
      createdAt,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Visitors!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return { success: true, id };
  } catch (error) {
    console.error("Error adding visitor to Google Sheets:", error);
    throw error;
  }
}

/**
 * Marks a visitor as exited by updating the exitTime and status columns.
 * @param id Visitor ID to locate the row.
 */
export async function markVisitorExit(id: string) {
  try {
    const { sheets, spreadsheetId } = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Visitors!A:J",
    });
    const rows = response.data.values;
    if (!rows) throw new Error("No rows found");

    const rowIndex = rows.slice(1).findIndex((row) => row[0] === id);
    console.log("Found rowIndex:", rowIndex);
    if (rowIndex === -1) throw new Error(`Visitor with id ${id} not found`);

    const absoluteRow = rowIndex + 2; // because sheet rows start at 1 and we skipped header
    console.log("Absolute row in sheet:", absoluteRow);

    const exitTime = "'" + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const status = "Exited";

    // Update columns H (exitTime) and I (status)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Visitors!H${absoluteRow}:I${absoluteRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[exitTime, status]] },
    });
    console.log("Update successful for row", absoluteRow);
    return { success: true };
  } catch (error) {
    console.error("Error marking visitor exit:", error);
    throw error;
  }
}

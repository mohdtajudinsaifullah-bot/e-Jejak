import { google } from "googleapis";
import path from "path";

export async function getGoogleSheets() {
  // Sistem akan cari fail rahsia JSON kau kat dalam folder projek
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), "google-credentials.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  
  // @ts-ignore - abaikan error jenis (type error) pada client
  const sheets = google.sheets({ version: "v4", auth: client });

  return sheets;
}
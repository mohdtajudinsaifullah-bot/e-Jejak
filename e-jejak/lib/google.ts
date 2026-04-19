import { google } from 'googleapis';

export async function getGoogleSheets() {
  // 1. Ambil Kunci Rahsia
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  
  // 2. Buang tanda " kat awal dan akhir kalau ter-copy secara tak sengaja
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  
  // 3. Pastikan format 'Enter' dibaca dengan betul oleh sistem
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client as any });
  return sheets;
}
'use server'

import { getGoogleSheets } from '@/lib/google'
import { revalidatePath } from 'next/cache'

// ENJIN UNTUK TAMBAH REKOD BARU KE GOOGLE SHEETS
export async function appendToSheet(tabName: string, values: any[]) {
  try {
    const sheets = await getGoogleSheets();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Arahkan Google Sheets untuk tambah data di baris paling bawah yang kosong
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tabName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    // Arahkan sistem untuk 'Refresh' data secara automatik lepas save
    revalidatePath('/dashboard');
    return { success: true };
    
  } catch (error) {
    console.error(`Gagal tambah data ke tab ${tabName}:`, error);
    return { success: false, error: "Gagal menyimpan data." };
  }
}

// ENJIN UNTUK KEMASKINI (EDIT) REKOD SEDIA ADA
// (Nota: Kita perlukan Nombor Baris / Row Number untuk edit data yang tepat)
export async function updateSheetRow(tabName: string, rowIndex: number, values: any[]) {
  try {
    const sheets = await getGoogleSheets();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Arahkan Google Sheets untuk tulis semula data pada baris spesifik (Contoh: Penempatan!A5:Z5)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tabName}!A${rowIndex}:Z${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    revalidatePath('/dashboard');
    return { success: true };

  } catch (error) {
    console.error(`Gagal kemaskini baris ${rowIndex} di tab ${tabName}:`, error);
    return { success: false, error: "Gagal mengemaskini data." };
  }
}
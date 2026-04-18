'use client'

import { useState } from 'react'
import { updateSheetRow } from '@/app/actions'

// Tukar Kalendar (YYYY-MM-DD) ke BM (15 Februari 2024)
function toMalayDate(isoDate: string) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Tukar BM (15 Februari 2024) ke Kalendar (YYYY-MM-DD)
function fromMalayDate(dateString: string) {
  if (!dateString || dateString.trim() === '-' || dateString === '') return '';
  const months: { [key: string]: string } = {
    'januari': '01', 'februari': '02', 'mac': '03', 'april': '04', 'mei': '05', 'jun': '06', 
    'julai': '07', 'ogos': '08', 'september': '09', 'oktober': '10', 'november': '11', 'disember': '12'
  };
  const parts = dateString.trim().split(' ');
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = months[parts[1].toLowerCase()];
    let year = parts[2];
    if (day && month && year) return `${year}-${month}-${day}`;
  }
  return '';
}

export default function EditPenempatanModal({ rowData, rowIndex }: { rowData: any[], rowIndex: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const senaraiNegeri = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan Kuala Lumpur", "Wilayah Persekutuan Labuan", "Wilayah Persekutuan Putrajaya"
  ];

  // Sedut data asal masuk ke dalam State
  const [jabatan, setJabatan] = useState(rowData[2] || '');
  const [jawatan, setJawatan] = useState(rowData[3] || '');
  const [gred, setGred] = useState(rowData[4] || '');
  const [negeri, setNegeri] = useState(rowData[5] || '');
  const [tarikhLapor, setTarikhLapor] = useState(fromMalayDate(rowData[6]));
  const [tarikhKeluar, setTarikhKeluar] = useState(fromMalayDate(rowData[7]));

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const formattedLapor = toMalayDate(tarikhLapor);
    const formattedKeluar = tarikhKeluar ? toMalayDate(tarikhKeluar) : '-';
    
    // Susunan data MESTI kekalkan IC dan ClerkID kat depan
    const values = [rowData[0], rowData[1], jabatan, jawatan, gred, negeri, formattedLapor, formattedKeluar];

    // Panggil enjin Kemaskini (updateSheetRow)
    const res = await updateSheetRow('Penempatan', rowIndex, values);

    if (res.success) {
      setIsOpen(false);
    } else {
      alert('Ralat: Gagal mengemaskini data!');
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-xs font-semibold bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
        Kemaskini
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-indigo-100">
            <h2 className="text-xl font-bold text-indigo-900 mb-5 flex items-center gap-2">
              <span>✏️</span> Kemaskini Penempatan
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan / Lokasi</label>
                <input required value={jabatan} onChange={e => setJabatan(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jawatan</label>
                <input required value={jawatan} onChange={e => setJawatan(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gred</label>
                  <input required value={gred} onChange={e => setGred(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Negeri</label>
                  <select required value={negeri} onChange={e => setNegeri(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="">-- Pilih --</option>
                    {senaraiNegeri.map((ngr, idx) => (
                      <option key={idx} value={ngr}>{ngr}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tarikh Lapor</label>
                  <input required type="date" value={tarikhLapor} onChange={e => setTarikhLapor(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tarikh Keluar</label>
                  <input type="date" value={tarikhKeluar} onChange={e => setTarikhKeluar(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1">*Kosongkan jika terkini</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Menyimpan...' : 'Simpan Kemaskini'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
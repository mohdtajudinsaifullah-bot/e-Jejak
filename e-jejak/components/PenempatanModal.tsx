'use client'

import { useState } from 'react'
import { appendToSheet } from '@/app/actions'

// Helper tukar format "YYYY-MM-DD" ke "15 Februari 2024"
function toMalayDate(isoDate: string) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PenempatanModal({ icNo, clerkId }: { icNo: string, clerkId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [jabatan, setJabatan] = useState('');
  const [jawatan, setJawatan] = useState('');
  const [gred, setGred] = useState('');
  const [negeri, setNegeri] = useState('');
  const [tarikhLapor, setTarikhLapor] = useState(''); // Simpan format sistem

  const senaraiNegeri = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan Kuala Lumpur", "Wilayah Persekutuan Labuan", "Wilayah Persekutuan Putrajaya"
  ];

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const formattedDate = toMalayDate(tarikhLapor); // Tukar ke BM automatik
    const values = [icNo, clerkId, jabatan, jawatan, gred, negeri, formattedDate, '-'];

    const res = await appendToSheet('Penempatan', values);

    if (res.success) {
      setIsOpen(false);
      setJabatan(''); setJawatan(''); setGred(''); setNegeri(''); setTarikhLapor('');
    } else alert('Ralat: Gagal menyimpan data ke Google Sheets!');
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-xs font-semibold bg-white text-indigo-600 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
        + Tambah
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-indigo-100">
            <h2 className="text-xl font-bold text-indigo-900 mb-5 flex items-center gap-2">
              <span>🏢</span> Tambah Penempatan
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan / Lokasi</label>
                <input required value={jabatan} onChange={e => setJabatan(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cth: Jabatan Kehakiman Syariah..." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jawatan</label>
                <input required value={jawatan} onChange={e => setJawatan(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cth: Penolong Pengarah Kanan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gred</label>
                  <input required value={gred} onChange={e => setGred(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cth: LS44" />
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
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tarikh Lapor Diri</label>
                <input required type="date" value={tarikhLapor} onChange={e => setTarikhLapor(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {loading ? 'Menyimpan...' : 'Simpan Rekod'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
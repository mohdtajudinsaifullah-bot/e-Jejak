'use client'
import { useState } from 'react'
import { updateSheetRow } from '@/app/actions'

export default function EditPasanganModal({ rowData, rowIndex }: { rowData: any[], rowIndex: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const senaraiNegeri = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan Kuala Lumpur", "Wilayah Persekutuan Labuan", "Wilayah Persekutuan Putrajaya"
  ];

  const [nama, setNama] = useState(rowData[2] || '');
  const [kerja, setKerja] = useState(rowData[3] || '');
  const [negeri, setNegeri] = useState(rowData[4] || '');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    // IC, ClerkID, Nama, Kerja, Negeri, (Kekalkan data anak jika ada)
    const res = await updateSheetRow('Waris', rowIndex, [rowData[0], rowData[1], nama, kerja, negeri, rowData[5] || '', rowData[6] || '']);
    if (res.success) setIsOpen(false);
    else alert('Gagal mengemaskini data!');
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="absolute top-3 right-3 text-xs font-semibold text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-rose-100 cursor-default">
            <h2 className="text-xl font-bold text-rose-900 mb-5">✏️ Kemaskini Pasangan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Pasangan</label>
                <input required value={nama} onChange={e => setNama(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Pekerjaan</label>
                <input required value={kerja} onChange={e => setKerja(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Negeri</label>
                <select required value={negeri} onChange={e => setNegeri(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                  <option value="">-- Pilih --</option>
                  {senaraiNegeri.map((ngr, idx) => (
                    <option key={idx} value={ngr}>{ngr}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold">{loading ? 'Simpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
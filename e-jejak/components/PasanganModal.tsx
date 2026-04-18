'use client'
import { useState } from 'react'
import { appendToSheet } from '@/app/actions'

export default function PasanganModal({ icNo, clerkId }: { icNo: string, clerkId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nama, setNama] = useState('');
  const [kerja, setKerja] = useState('');
  const [negeri, setNegeri] = useState('');

  const senaraiNegeri = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan Kuala Lumpur", "Wilayah Persekutuan Labuan", "Wilayah Persekutuan Putrajaya"
  ];

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    // Kolum: IC, ClerkID, Nama Pasangan, Kerja, Negeri, (Anak kosongkan)
    const res = await appendToSheet('Waris', [icNo, clerkId, nama, kerja, negeri, '', '']);
    if (res.success) {
      setIsOpen(false);
      setNama(''); setKerja(''); setNegeri('');
    } else alert('Gagal menyimpan data!');
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-xs font-semibold bg-white text-rose-600 border border-rose-200 px-3 py-1 rounded hover:bg-rose-600 hover:text-white transition-all shadow-sm">+ Tambah</button>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-rose-100">
            <h2 className="text-xl font-bold text-rose-900 mb-5">❤️ Tambah Pasangan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Pasangan</label>
                <input required value={nama} onChange={e => setNama(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Pekerjaan</label>
                <input required value={kerja} onChange={e => setKerja(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Cth: Guru / PTD / Suri Rumah" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Negeri Tempat Tinggal/Kerja</label>
                <select required value={negeri} onChange={e => setNegeri(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                  <option value="">-- Sila Pilih Negeri --</option>
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
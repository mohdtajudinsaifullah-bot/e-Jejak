'use client'
import { useState } from 'react'
import { appendToSheet } from '@/app/actions'

export default function AnakModal({ icNo, clerkId }: { icNo: string, clerkId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nama, setNama] = useState('');
  const [sekolah, setSekolah] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    // Kolum: IC, ClerkID, (Pasangan kosongkan), Nama Anak, Sekolah
    const res = await appendToSheet('Waris', [icNo, clerkId, '', '', '', nama, sekolah]);
    if (res.success) {
      setIsOpen(false);
      setNama(''); setSekolah('');
    } else alert('Gagal menyimpan data!');
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-xs font-semibold bg-white text-amber-600 border border-amber-200 px-3 py-1 rounded hover:bg-amber-500 hover:text-white transition-all shadow-sm">+ Tambah</button>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 mb-5">🧒 Tambah Anak</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Anak</label>
                <input required value={nama} onChange={e => setNama(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Maklumat Sekolah / IPT</label>
                <input required value={sekolah} onChange={e => setSekolah(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Cth: SK Putrajaya Presint 8" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold">{loading ? 'Simpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
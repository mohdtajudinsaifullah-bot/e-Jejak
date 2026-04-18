'use client'
import { useState } from 'react'
import { updateSheetRow } from '@/app/actions'

export default function EditAnakModal({ rowData, rowIndex }: { rowData: any[], rowIndex: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nama, setNama] = useState(rowData[5] || '');
  const [sekolah, setSekolah] = useState(rowData[6] || '');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    // IC, ClerkID, (Kekalkan data pasangan jika ada), Nama Anak, Sekolah
    const res = await updateSheetRow('Waris', rowIndex, [rowData[0], rowData[1], rowData[2] || '', rowData[3] || '', rowData[4] || '', nama, sekolah]);
    if (res.success) setIsOpen(false);
    else alert('Gagal mengemaskini data!');
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="absolute top-3 right-3 text-xs font-semibold text-amber-500 hover:text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-amber-100 cursor-default">
            <h2 className="text-xl font-bold text-amber-900 mb-5">✏️ Kemaskini Anak</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Anak</label>
                <input required value={nama} onChange={e => setNama(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Sekolah / IPT</label>
                <input required value={sekolah} onChange={e => setSekolah(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
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
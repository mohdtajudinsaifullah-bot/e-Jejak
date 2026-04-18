'use client'
import { useState } from 'react'
import { appendToSheet } from '@/app/actions'

function toMalayDate(isoDate: string) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PangkatModal({ icNo, clerkId }: { icNo: string, clerkId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gred, setGred] = useState('');
  const [tarikh, setTarikh] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    
    const formattedDate = toMalayDate(tarikh); // Tukar ke BM automatik
    const res = await appendToSheet('Kenaikan_Pangkat', [icNo, clerkId, gred, formattedDate, '-']);
    
    if (res.success) {
      setIsOpen(false);
      setGred(''); setTarikh('');
    } else alert('Gagal menyimpan data!');
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-xs font-semibold bg-white text-emerald-600 border border-emerald-200 px-3 py-1 rounded hover:bg-emerald-600 hover:text-white transition-all shadow-sm">+ Tambah</button>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-900 mb-5">📈 Tambah Pangkat</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Gred Baru</label>
                <input required value={gred} onChange={e => setGred(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: LS48" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tarikh Kuatkuasa</label>
                <input required type="date" value={tarikh} onChange={e => setTarikh(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">{loading ? 'Simpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
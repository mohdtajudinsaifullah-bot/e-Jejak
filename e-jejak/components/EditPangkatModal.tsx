'use client'
import { useState } from 'react'
import { updateSheetRow } from '@/app/actions'

function toMalayDate(isoDate: string) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

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

export default function EditPangkatModal({ rowData, rowIndex }: { rowData: any[], rowIndex: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [gred, setGred] = useState(rowData[2] || '');
  const [tarikh, setTarikh] = useState(fromMalayDate(rowData[3]));
  const [tarikhHingga, setTarikhHingga] = useState(fromMalayDate(rowData[4]));

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    const formattedTarikh = toMalayDate(tarikh);
    const formattedHingga = tarikhHingga ? toMalayDate(tarikhHingga) : '-';
    
    // Susunan: IC, ClerkID, Gred, Tarikh Mula, Tarikh Hingga
    const res = await updateSheetRow('Kenaikan_Pangkat', rowIndex, [rowData[0], rowData[1], gred, formattedTarikh, formattedHingga]);
    
    if (res.success) setIsOpen(false);
    else alert('Gagal mengemaskini data!');
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-xs font-semibold bg-white text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded hover:bg-emerald-600 hover:text-white transition-all shadow-sm">Kemaskini</button>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-900 mb-5">✏️ Kemaskini Pangkat</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Gred</label>
                <input required value={gred} onChange={e => setGred(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tarikh Kuatkuasa</label>
                <input required type="date" value={tarikh} onChange={e => setTarikh(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tarikh Hingga</label>
                <input type="date" value={tarikhHingga} onChange={e => setTarikhHingga(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                <p className="text-[10px] text-slate-400 mt-1">*Kosongkan jika pangkat terkini</p>
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
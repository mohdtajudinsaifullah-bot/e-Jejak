'use client'

import { useState } from 'react'
import { appendToSheet } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function BorangProfilBaru({ clerkId }: { clerkId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [ic, setIc] = useState('');
  const [nama, setNama] = useState('');
  const [emel, setEmel] = useState('');
  const [alamat, setAlamat] = useState('');
  const [tarikhLantikan, setTarikhLantikan] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    // Tukar format tarikh kalendar ke BM
    let formattedDate = '-';
    if (tarikhLantikan) {
      const d = new Date(tarikhLantikan);
      const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
      formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    // Susunan Wajib Tab Users: IC (0), ClerkID (1), Emel (2), Nama (3), Alamat (4), Tarikh Lantikan (5)
    const values = [ic, clerkId, emel, nama, alamat, formattedDate];

    // Simpan ke Google Sheets tab 'Users'
    const res = await appendToSheet('Users', values);

    if (res.success) {
      // Refresh halaman supaya dia terus masuk ke Dashboard penuh
      window.location.reload(); 
    } else {
      alert('Ralat: Gagal mendaftarkan profil!');
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-2xl mx-auto mt-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">👋</div>
        <h2 className="text-2xl font-bold text-slate-800">Selamat Datang ke e-Jejak!</h2>
        <p className="text-slate-500 mt-2">Nampaknya ini kali pertama anda log masuk. Sila lengkapkan maklumat profil asas di bawah untuk mula menggunakan sistem.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">No. Kad Pengenalan</label>
            <input required value={ic} onChange={e => setIc(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: 840311035035" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nama Penuh</label>
            <input required value={nama} onChange={e => setNama(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Mohd Tajudin Saifullah..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">E-mel Rasmi</label>
            <input required type="email" value={emel} onChange={e => setEmel(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: nama@esyariah.gov.my" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Tarikh Lantikan Skim</label>
            <input required type="date" value={tarikhLantikan} onChange={e => setTarikhLantikan(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Alamat Terkini</label>
          <textarea required value={alamat} onChange={e => setAlamat(e.target.value)} rows={3} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan alamat kediaman terkini..." />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4">
          {loading ? 'Mendaftarkan Profil...' : 'Simpan Profil & Masuk Dashboard'}
        </button>
      </form>
    </div>
  )
}
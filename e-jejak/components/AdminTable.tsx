'use client'

import { useState } from 'react'

export default function AdminTable({ masterData }: { masterData: any[] }) {
  const [search, setSearch] = useState('');
  const [filterGred, setFilterGred] = useState('');
  const [filterNegeri, setFilterNegeri] = useState('');
  const [filterTahun, setFilterTahun] = useState('');

  // Senarai unik untuk dropdown
  const senaraiGred = Array.from(new Set(masterData.map(d => d.gredTerkini).filter(g => g !== '-'))).sort();
  const senaraiNegeri = Array.from(new Set(masterData.map(d => d.negeriTerkini).filter(n => n !== '-'))).sort();

  // LOGIK PENAPISAN (FILTERING)
  const filteredData = masterData.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchGred = filterGred === '' || p.gredTerkini === filterGred;
    const matchNegeri = filterNegeri === '' || p.negeriTerkini === filterNegeri;
    
    // Logik Tahun (Tahun Khidmat adalah integer dari data)
    let matchTahun = true;
    const tahunInt = parseInt(p.tahunKhidmatRaw);
    if (filterTahun === 'baru') matchTahun = tahunInt < 5;
    else if (filterTahun === 'mid') matchTahun = tahunInt >= 5 && tahunInt <= 10;
    else if (filterTahun === 'senior') matchTahun = tahunInt > 10;

    return matchSearch && matchGred && matchNegeri && matchTahun;
  });

  return (
    <div className="space-y-6">
      {/* BAHAGIAN SEARCH & FILTER */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">Carian Nama</label>
          <input 
            type="text" 
            placeholder="Taip nama pegawai..." 
            className="w-full mt-1 border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tapis Gred</label>
          <select 
            className="w-full mt-1 border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            value={filterGred}
            onChange={(e) => setFilterGred(e.target.value)}
          >
            <option value="">Semua Gred</option>
            {senaraiGred.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tapis Negeri</label>
          <select 
            className="w-full mt-1 border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            value={filterNegeri}
            onChange={(e) => setFilterNegeri(e.target.value)}
          >
            <option value="">Semua Negeri</option>
            {senaraiNegeri.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Khidmat</label>
          <select 
            className="w-full mt-1 border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
          >
            <option value="">Semua Tahun</option>
            <option value="baru">Baru (Bawah 5 Thn)</option>
            <option value="mid">Pertengahan (5-10 Thn)</option>
            <option value="senior">Senior (Atas 10 Thn)</option>
          </select>
        </div>
      </div>

      {/* JADUAL DATA */}
      <div className="overflow-x-auto shadow-sm border border-slate-200 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-4">Maklumat Pegawai</th>
              <th className="px-4 py-4">Penempatan Terkini</th>
              <th className="px-4 py-4 text-center">Gred</th>
              <th className="px-4 py-4 text-center">Tempoh</th>
              <th className="px-4 py-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredData.length > 0 ? filteredData.map((pegawai, idx) => (
              <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-800 uppercase">{pegawai.nama}</p>
                  <p className="text-xs text-slate-500">{pegawai.emel}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-700">{pegawai.jawatanTerkini}</p>
                  <p className="text-xs text-slate-500">{pegawai.jabatanTerkini}, {pegawai.negeriTerkini}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-100">{pegawai.gredTerkini}</span>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-emerald-600">
                  {pegawai.tempohKhidmat}
                </td>
                <td className="px-4 py-4 text-center">
                   <button className="text-[10px] font-bold bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all shadow-sm">VIEW</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400 italic font-medium">Tiada rekod pegawai dijumpai mengikut tapisan anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 italic">Menunjukkan {filteredData.length} daripada {masterData.length} pegawai.</p>
    </div>
  )
}
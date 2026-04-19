import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { getGoogleSheets } from '@/lib/google'
import BorangProfilBaru from '@/components/BorangProfilBaru'

// TAMBAHKAN DUA BARIS KODE INI DI SINI BRO:
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Import semua Modal Tambah
import PenempatanModal from '@/components/PenempatanModal'
import PangkatModal from '@/components/PangkatModal'
import PasanganModal from '@/components/PasanganModal'
import AnakModal from '@/components/AnakModal'

// Import semua Modal Kemaskini
import EditPenempatanModal from '@/components/EditPenempatanModal'
import EditPangkatModal from '@/components/EditPangkatModal'
import EditPasanganModal from '@/components/EditPasanganModal'
import EditAnakModal from '@/components/EditAnakModal'

function parseMalayDate(dateString: string) {
  if (!dateString || dateString.trim() === '-' || dateString.trim() === '') return null;
  const months: { [key: string]: number } = {
    'januari': 0, 'februari': 1, 'mac': 2, 'april': 3, 'mei': 4, 'jun': 5,
    'julai': 6, 'ogos': 7, 'september': 8, 'oktober': 9, 'november': 10, 'disember': 11
  };
  const parts = dateString.trim().split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) return new Date(year, month, day);
  }
  return null;
}

function getDuration(startStr: string, endStr?: string) {
  const start = parseMalayDate(startStr);
  if (!start) return '';
  const end = endStr && endStr.trim() !== '-' ? parseMalayDate(endStr) || new Date() : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return ''; 
  if (years === 0 && months === 0) return '(Kurang 1 bln)';

  let res = [];
  if (years > 0) res.push(`${years} thn`);
  if (months > 0) res.push(`${months} bln`);
  return `(${res.join(' ')})`;
}

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  let userData = null;
  let penempatanData: any[] = [];
  let pangkatData: any[] = [];
  let spousesData: any[] = [];
  let childrenData: any[] = [];

  try {
    const sheets = await getGoogleSheets();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    const [usersRes, penempatanRes, warisRes, pangkatRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Users!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Penempatan!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Waris!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Kenaikan_Pangkat!A:Z' }),
    ]);

    userData = (usersRes.data.values || []).find((row) => row[1] === userId);
    
    // TANGKAP NOMBOR BARIS UNTUK SEMUA JADUAL
    const penempatanRaw = penempatanRes.data.values || [];
    penempatanData = penempatanRaw.map((row, index) => ({ row, rowIndex: index + 1 })).filter(item => item.row[1] === userId);

    const pangkatRaw = pangkatRes.data.values || [];
    pangkatData = pangkatRaw.map((row, index) => ({ row, rowIndex: index + 1 })).filter(item => item.row[1] === userId);

    const warisRaw = warisRes.data.values || [];
    const warisFiltered = warisRaw.map((row, index) => ({ row, rowIndex: index + 1 })).filter(item => item.row[1] === userId);
    
    spousesData = warisFiltered.filter(item => item.row[2] && item.row[2].trim() !== '' && item.row[2].trim() !== '-');
    childrenData = warisFiltered.filter(item => item.row[5] && item.row[5].trim() !== '' && item.row[5].trim() !== '-');

  } catch (error) {
    console.error("Gagal tarik data Google Sheets:", error);
  }

  const sortedPenempatan = [...penempatanData].sort((a, b) => {
    const dateA = parseMalayDate(a.row[6])?.getTime() || 0;
    const dateB = parseMalayDate(b.row[6])?.getTime() || 0;
    return dateB - dateA; 
  });
  const currentPlacement = sortedPenempatan.length > 0 ? sortedPenempatan[0].row : null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <header className="flex justify-between items-center bg-slate-900 p-5 rounded-t-xl shadow-md mb-6 border-b-4 border-blue-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow">eJ</div>
          <h1 className="text-xl font-bold text-white tracking-wide">Sistem e-Jejak Pegawai Syariah</h1>
        </div>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-slate-500" } }} />
      </header>

      {userData ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-t-blue-600 border-x border-b border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
              <div className="w-24 h-24 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-4 border-4 border-white shadow-sm">
                {userData[3] ? userData[3].charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">{userData[3] || 'TIADA NAMA'}</h2>
                <p className="text-sm font-mono text-slate-500 mt-1">{userData[0]}</p>
              </div>
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Penempatan Semasa</p>
                  {currentPlacement ? (
                    <>
                      <p className="text-sm font-bold text-slate-800 mt-1">{currentPlacement[3]} <span className="text-blue-700">({currentPlacement[4]})</span></p>
                      <p className="text-xs text-slate-600 mt-0.5">{currentPlacement[2]}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{currentPlacement[5]}</p>
                    </>
                  ) : <p className="text-sm font-medium text-slate-700">-</p>}
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Tarikh Lantikan Skim</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {userData[5] || '-'} <span className="text-blue-600 font-bold ml-1">{userData[5] ? getDuration(userData[5]) : ''}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">E-mel Rasmi</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">{userData[2] || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Alamat Terkini</p>
                  <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">{userData[4] || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-6">
            
            <div className="bg-white rounded-xl shadow-md border-t-4 border-t-indigo-600 border-x border-b border-slate-200 overflow-hidden">
              <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex justify-between items-center">
                <h3 className="text-base font-bold text-indigo-900 tracking-wide flex items-center gap-2"><span>🏢</span> Rekod Perjawatan & Penempatan</h3>
                <PenempatanModal icNo={userData[0]} clerkId={userId} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-indigo-800 text-indigo-50 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium">Jabatan & Jawatan</th>
                      <th className="px-4 py-3 font-medium">Tarikh Lapor</th>
                      <th className="px-4 py-3 font-medium">Tarikh Keluar</th>
                      <th className="px-4 py-3 font-medium">Tempoh</th>
                      <th className="px-4 py-3 font-medium text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedPenempatan.length > 0 ? sortedPenempatan.map((item, index) => (
                      <tr key={index} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{item.row[3] || '-'} <span className="text-indigo-600">({item.row[4] || '-'})</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.row[2] || '-'}, {item.row[5] || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{item.row[6] || '-'}</td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{item.row[7] && item.row[7] !== '-' ? item.row[7] : <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded text-xs border border-emerald-200">KINI</span>}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{getDuration(item.row[6], item.row[7])}</td>
                        <td className="px-4 py-3 text-center">
                          <EditPenempatanModal rowData={item.row} rowIndex={item.rowIndex} />
                        </td>
                      </tr>
                    )) : <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">Tiada rekod penempatan dijumpai.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border-t-4 border-t-emerald-500 border-x border-b border-slate-200 overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex justify-between items-center">
                <h3 className="text-base font-bold text-emerald-900 tracking-wide flex items-center gap-2"><span>📈</span> Sejarah Kenaikan Pangkat</h3>
                <PangkatModal icNo={userData[0]} clerkId={userId} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-emerald-800 text-emerald-50 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium w-32">Gred</th>
                      <th className="px-4 py-3 font-medium">Tarikh Kuatkuasa</th>
                      <th className="px-4 py-3 font-medium">Tempoh Berkhidmat</th>
                      <th className="px-4 py-3 font-medium text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pangkatData.length > 0 ? pangkatData.map((item, index) => (
                      <tr key={index} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-4 py-3 font-extrabold text-emerald-700 text-base">{item.row[2] || '-'}</td>
                        <td className="px-4 py-3">
                          <p className="text-slate-800 font-medium">{item.row[3] || '-'}</p>
                          {item.row[4] && item.row[4] !== '-' && <p className="text-xs text-slate-500 mt-0.5">Hingga: {item.row[4]}</p>}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-600">{getDuration(item.row[3], item.row[4])}</td>
                        <td className="px-4 py-3 text-right">
                          <EditPangkatModal rowData={item.row} rowIndex={item.rowIndex} />
                        </td>
                      </tr>
                    )) : <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">Tiada rekod kenaikan pangkat.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-xl shadow-md border-t-4 border-t-rose-500 border-x border-b border-slate-200 overflow-hidden flex flex-col">
                <div className="bg-rose-50 border-b border-rose-100 p-4 flex justify-between items-center">
                  <h3 className="text-base font-bold text-rose-900 tracking-wide flex items-center gap-2"><span>❤️</span> Maklumat Pasangan</h3>
                  <PasanganModal icNo={userData[0]} clerkId={userId} />
                </div>
                <div className="p-4 space-y-3 flex-1">
                  {spousesData.length > 0 ? spousesData.slice(0, 4).map((item, index) => (
                    <div key={index} className="bg-white border border-rose-100 p-3 rounded-lg shadow-sm relative group hover:border-rose-300 transition-all">
                      <EditPasanganModal rowData={item.row} rowIndex={item.rowIndex} />
                      <p className="text-sm font-bold text-slate-800">{item.row[2]}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium">{item.row[3] || 'Tiada Pekerjaan'}</span>
                        <span>•</span>
                        <span>{item.row[4] || '-'}</span>
                      </div>
                    </div>
                  )) : <p className="text-center text-slate-400 italic py-4">Tiada rekod pasangan.</p>}
                  {spousesData.length >= 4 && <p className="text-[10px] text-center text-rose-400 mt-2 italic">*Maksimum 4 rekod pasangan dipaparkan.</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border-t-4 border-t-amber-500 border-x border-b border-slate-200 overflow-hidden flex flex-col">
                <div className="bg-amber-50 border-b border-amber-100 p-4 flex justify-between items-center">
                  <h3 className="text-base font-bold text-amber-900 tracking-wide flex items-center gap-2"><span>🧒</span> Maklumat Anak</h3>
                  <AnakModal icNo={userData[0]} clerkId={userId} />
                </div>
                <div className="p-4 space-y-3 flex-1 h-64 overflow-y-auto">
                  {childrenData.length > 0 ? childrenData.map((item, index) => (
                    <div key={index} className="bg-white border border-amber-100 p-3 rounded-lg shadow-sm relative group hover:border-amber-300 transition-all">
                      <EditAnakModal rowData={item.row} rowIndex={item.rowIndex} />
                      <p className="text-sm font-bold text-slate-800 pr-8">{item.row[5]}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="text-amber-600">🎓</span> {item.row[6] || 'Tiada Maklumat Sekolah'}
                      </p>
                    </div>
                  )) : <p className="text-center text-slate-400 italic py-4">Tiada rekod anak.</p>}
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <BorangProfilBaru clerkId={userId} />
      )}
    </div>
  )
}
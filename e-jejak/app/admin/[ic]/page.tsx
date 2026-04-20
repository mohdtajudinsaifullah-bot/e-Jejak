import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getGoogleSheets } from '@/lib/google'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  if (months < 0) { years--; months += 12; }
  if (years < 0) return ''; 
  if (years === 0 && months === 0) return '(Kurang 1 bln)';
  let res = [];
  if (years > 0) res.push(`${years} thn`);
  if (months > 0) res.push(`${months} bln`);
  return `(${res.join(' ')})`;
}

export default async function AdminUserProfile({ params }: { params: { ic: string } }) {
  const user = await currentUser();
  if (!user) redirect('/');

  const username = user.username ? user.username.trim().toLowerCase() : '';
  const userEmail = user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() || '';

  // Semak Keselamatan Admin
  let hasAdminAccess = false;
  try {
    const sheets = await getGoogleSheets();
    const adminRes = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID, range: 'Admin!A:A' });
    const adminList = (adminRes.data.values || []).flat().map(e => String(e).trim().toLowerCase());
    if ((username && adminList.includes(username)) || (userEmail && adminList.includes(userEmail))) {
      hasAdminAccess = true;
    }
  } catch (e) {}

  if (!hasAdminAccess) redirect('/dashboard');

  const icNo = params.ic;
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
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Kenaikan_Pangkat!A:Z' })
    ]);

    // Cari rekod berdasarkan IC
    userData = (usersRes.data.values || []).find((row) => row[0] === icNo);
    penempatanData = (penempatanRes.data.values || []).filter((row) => row[0] === icNo);
    pangkatData = (pangkatRes.data.values || []).filter((row) => row[0] === icNo);
    
    const warisRaw = (warisRes.data.values || []).filter((row) => row[0] === icNo);
    spousesData = warisRaw.filter(row => row[2] && row[2].trim() !== '' && row[2].trim() !== '-');
    childrenData = warisRaw.filter(row => row[5] && row[5].trim() !== '' && row[5].trim() !== '-');

  } catch (error) {
    console.error("Gagal tarik data Pegawai:", error);
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Rekod Tidak Dijumpai</h2>
          <p className="text-slate-600 mb-6">Tiada pegawai dengan No. Kad Pengenalan {icNo}.</p>
          <Link href="/admin" className="px-4 py-2 bg-slate-800 text-white rounded-lg">Kembali ke Direktori</Link>
        </div>
      </div>
    );
  }

  const sortedPenempatan = [...penempatanData].sort((a, b) => {
    const dateA = parseMalayDate(a[6])?.getTime() || 0;
    const dateB = parseMalayDate(b[6])?.getTime() || 0;
    return dateB - dateA; 
  });
  const currentPlacement = sortedPenempatan.length > 0 ? sortedPenempatan[0] : null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-bold text-slate-500 hover:text-amber-600 flex items-center gap-2">
          <span>&larr;</span> Kembali ke Direktori Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* KOTAK KIRI */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-t-amber-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>
            <div className="w-24 h-24 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-4 border-4 border-white shadow-sm">
              {userData[3] ? userData[3].charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">{userData[3]}</h2>
              <p className="text-sm font-mono text-slate-500 mt-1">{userData[0]}</p>
            </div>
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Penempatan Semasa</p>
                {currentPlacement ? (
                  <>
                    <p className="text-sm font-bold text-slate-800 mt-1">{currentPlacement[3]} <span className="text-amber-700">({currentPlacement[4]})</span></p>
                    <p className="text-xs text-slate-600 mt-0.5">{currentPlacement[2]}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{currentPlacement[5]}</p>
                  </>
                ) : <p className="text-sm font-medium text-slate-700">-</p>}
              </div>
              <div>
                <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Tarikh Lantikan Skim</p>
                <p className="text-sm font-medium text-slate-800 mt-1">
                  {userData[5] || '-'} <span className="text-amber-600 font-bold ml-1">{userData[5] ? getDuration(userData[5]) : ''}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">E-mel Rasmi</p>
                <p className="text-sm font-medium text-slate-800 mt-1">{userData[2] || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KOTAK KANAN */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-md border-t-4 border-t-indigo-600 overflow-hidden">
            <div className="bg-indigo-50 border-b border-indigo-100 p-4">
              <h3 className="text-base font-bold text-indigo-900">🏢 Rekod Perjawatan & Penempatan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-indigo-800 text-indigo-50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Jabatan & Jawatan</th>
                    <th className="px-4 py-3">Tarikh Lapor</th>
                    <th className="px-4 py-3">Tarikh Keluar</th>
                    <th className="px-4 py-3">Tempoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedPenempatan.length > 0 ? sortedPenempatan.map((item, index) => (
                    <tr key={index} className="hover:bg-indigo-50/50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{item[3] || '-'} <span className="text-indigo-600">({item[4] || '-'})</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">{item[2] || '-'}, {item[5] || '-'}</p>
                      </td>
                      <td className="px-4 py-3">{item[6] || '-'}</td>
                      <td className="px-4 py-3">{item[7] && item[7] !== '-' ? item[7] : <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded text-xs">KINI</span>}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{getDuration(item[6], item[7])}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">Tiada rekod.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-t-4 border-t-emerald-500 overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-100 p-4">
              <h3 className="text-base font-bold text-emerald-900">📈 Sejarah Kenaikan Pangkat</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-emerald-800 text-emerald-50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 w-32">Gred</th>
                    <th className="px-4 py-3">Tarikh Kuatkuasa</th>
                    <th className="px-4 py-3">Tempoh Berkhidmat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pangkatData.length > 0 ? pangkatData.map((row, index) => (
                    <tr key={index} className="hover:bg-emerald-50/50">
                      <td className="px-4 py-3 font-extrabold text-emerald-700 text-base">{row[2] || '-'}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800 font-medium">{row[3] || '-'}</p>
                        {row[4] && row[4] !== '-' && <p className="text-xs text-slate-500 mt-0.5">Hingga: {row[4]}</p>}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-600">{getDuration(row[3], row[4])}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 italic">Tiada rekod.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border-t-4 border-t-rose-500 overflow-hidden">
              <div className="bg-rose-50 border-b border-rose-100 p-4">
                <h3 className="text-base font-bold text-rose-900">❤️ Maklumat Pasangan</h3>
              </div>
              <div className="p-4 space-y-3">
                {spousesData.length > 0 ? spousesData.map((row, index) => (
                  <div key={index} className="bg-white border border-rose-100 p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-slate-800">{row[2]}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium">{row[3] || 'Tiada Pekerjaan'}</span>
                      <span>•</span><span>{row[4] || '-'}</span>
                    </div>
                  </div>
                )) : <p className="text-center text-slate-400 italic py-4">Tiada rekod.</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border-t-4 border-t-amber-500 overflow-hidden">
              <div className="bg-amber-50 border-b border-amber-100 p-4">
                <h3 className="text-base font-bold text-amber-900">🧒 Maklumat Anak</h3>
              </div>
              <div className="p-4 space-y-3 h-64 overflow-y-auto">
                {childrenData.length > 0 ? childrenData.map((row, index) => (
                  <div key={index} className="bg-white border border-amber-100 p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-slate-800">{row[5]}</p>
                    <p className="text-xs text-slate-500 mt-1">🎓 {row[6] || 'Tiada Sekolah'}</p>
                  </div>
                )) : <p className="text-center text-slate-400 italic py-4">Tiada rekod.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
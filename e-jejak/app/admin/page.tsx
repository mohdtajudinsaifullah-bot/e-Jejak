import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { getGoogleSheets } from '@/lib/google'
import AdminTable from '@/components/AdminTable'

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

function getDuration(startStr: string) {
  const start = parseMalayDate(startStr);
  if (!start) return { string: '-', years: 0 };
  const end = new Date();
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0) { years--; months += 12; }
  return { 
    string: years > 0 ? `${years} thn ${months} bln` : `${months} bln`,
    years: years 
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const user = await currentUser();
  if (!user) redirect('/');
  
  const username = user.username ? user.username.trim().toLowerCase() : '';
  const userEmail = user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() || '';

  let allUsers: any[] = [];
  let allPenempatan: any[] = [];
  
  // PENANDA AKSES ADMIN
  let hasAdminAccess = false;

  try {
    const sheets = await getGoogleSheets();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    const [usersRes, penempatanRes, adminRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Users!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Penempatan!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Admin!A:A' }),
    ]);

    const adminList = (adminRes.data.values || []).flat().map(e => String(e).trim().toLowerCase());
    
    if ((username && adminList.includes(username)) || (userEmail && adminList.includes(userEmail))) {
      hasAdminAccess = true;
    }

    allUsers = usersRes.data.values?.filter(row => row[0] && row[0] !== 'ic_no' && row[1]) || [];
    allPenempatan = penempatanRes.data.values || [];

  } catch (error) {
    console.error("Gagal tarik data Admin:", error);
  }

  // JIKA BUKAN ADMIN, TENDANG KELUAR DI SINI (Luar kotak try...catch)
  if (!hasAdminAccess) {
    redirect('/dashboard'); 
  }

  const masterData = allUsers.map(u => {
    const userPlacements = allPenempatan.filter(p => p[0] === u[0]);
    userPlacements.sort((a, b) => {
      const dateA = parseMalayDate(a[6])?.getTime() || 0;
      const dateB = parseMalayDate(b[6])?.getTime() || 0;
      return dateB - dateA;
    });
    
    const terkini = userPlacements[0] || [];
    const durationObj = getDuration(u[5]);
    
    return {
      nama: u[3],
      emel: u[2],
      gredTerkini: terkini[4] || '-',
      negeriTerkini: terkini[5] || '-',
      jawatanTerkini: terkini[3] || '-',
      jabatanTerkini: terkini[2] || '-',
      tempohKhidmat: durationObj.string,
      tahunKhidmatRaw: durationObj.years
    };
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <header className="flex justify-between items-center bg-slate-900 p-5 rounded-t-2xl shadow-lg mb-6 border-b-4 border-amber-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-slate-900 shadow-lg">A</div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Pusat Kawalan Pentadbir</h1>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">e-Jejak Pegawai Syariah</p>
          </div>
        </div>
        <UserButton />
      </header>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Direktori Pegawai</h2>
            <p className="text-sm text-slate-500">Pantau dan tapis maklumat pegawai secara real-time.</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-black text-amber-500">{masterData.length}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Pegawai</div>
          </div>
        </div>
        <AdminTable masterData={masterData} />
      </div>
    </div>
  )
}
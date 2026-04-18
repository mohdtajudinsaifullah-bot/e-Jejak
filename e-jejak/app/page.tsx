import { SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-24">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">e-Jejak</h1>
        <p className="text-gray-500 mb-8">Sistem Profil & Penempatan Pegawai Syariah</p>

        {userId ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-600 font-semibold">Anda telah berjaya log masuk!</p>
            <UserButton />
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm font-bold mt-2">
              Masuk ke Dashboard ➔
            </Link>
          </div>
        ) : (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col items-center">
            <p className="text-sm text-gray-700 mb-6">Sila log masuk menggunakan No. Kad Pengenalan anda.</p>
            
            {/* PASTIKAN BARIS DI BAWAH INI LURUS SAHAJA. JANGAN TEKAN ENTER DI TENGAHNYA */}
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard"><button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-all">Log Masuk</button></SignInButton>
            
          </div>
        )}
      </div>
    </main>
  )
}
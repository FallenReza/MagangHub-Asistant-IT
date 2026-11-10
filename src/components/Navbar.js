import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? await verifyToken(token) : null;

  return (
    <nav className="bg-orange-600 text-white shadow-lg drop-shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-extrabold text-2xl tracking-wider text-cream drop-shadow-sm">
          KULA WISATA
        </Link>
        <div className="flex gap-4 items-center font-bold">
          {!user && (
            <>
              <Link href="/login" className="hover:text-amber-200">Login</Link>
              <Link href="/register" className="bg-amber-800 px-4 py-2 rounded hover:bg-amber-900">Register</Link>
            </>
          )}
          {user?.role === 'user' && (
            <>
              <Link href="/destinasi" className="hover:text-amber-200">Destinasi</Link>
              <Link href="/pesanan" className="hover:text-amber-200">Pesanan Saya</Link>
              <LogoutButton />
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link href="/admin" className="hover:text-amber-200">Dashboard</Link>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
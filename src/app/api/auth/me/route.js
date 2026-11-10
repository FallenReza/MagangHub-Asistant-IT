import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return Response.json({ user: null }, { status: 401 });
  
  const payload = await verifyToken(token);
  if (!payload) return Response.json({ user: null }, { status: 401 });

  return Response.json({ user: payload });
}
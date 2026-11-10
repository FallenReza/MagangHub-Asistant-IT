import { SignJWT, jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET tidak ditemukan di env');
  return new TextEncoder().encode(secret);
};

// Membuat token saat login
export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Berlaku 1 hari
    .sign(getJwtSecretKey());
}

// Memverifikasi token saat cek login
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null; // Token tidak valid / expired
  }
}
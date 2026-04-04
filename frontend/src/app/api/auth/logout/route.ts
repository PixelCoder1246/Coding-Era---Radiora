import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-13-204-42-87.nip.io';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('radiora_token')?.value;

    // Forward logout to backend
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {}); // best-effort

    // Always clear the cookie on the frontend side regardless
    const res = NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });
    res.cookies.set('radiora_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 0,
      path: '/',
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Logout failed.' }, { status: 500 });
  }
}

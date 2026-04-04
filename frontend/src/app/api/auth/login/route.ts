import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-13-204-42-87.nip.io';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward to backend
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Build response and MANUALLY forward the Set-Cookie header.
    // Next.js rewrites strip Set-Cookie — this route exists solely to fix that.
    const res = NextResponse.json(data, { status: 200 });

    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      res.headers.set('set-cookie', setCookie);
    } else {
      // Fallback: set cookie from the token in the body
      if (data?.token) {
        res.cookies.set('radiora_token', data.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
      }
    }

    return res;
  } catch (err) {
    console.error('[Login Proxy] Error:', err);
    return NextResponse.json({ error: 'Login service unavailable.' }, { status: 502 });
  }
}

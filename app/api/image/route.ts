import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) return new NextResponse('Missing image url', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse('Invalid image url', { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new NextResponse('Unsupported protocol', { status: 400 });
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 PhotoClinic Instagram Analyzer',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      cache: 'no-store'
    });

    if (!response.ok) return new NextResponse('Image fetch failed', { status: response.status });

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('URL is not an image', { status: 400 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch {
    return new NextResponse('Image proxy error', { status: 500 });
  }
}

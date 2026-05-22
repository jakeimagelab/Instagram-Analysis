import { NextRequest, NextResponse } from 'next/server';

function parseUsername(input: string) {
  let s = String(input || '').trim();
  if (s.startsWith('@')) s = s.substring(1);
  const match = s.match(/instagram\.com\/([^/?#]+)/i);
  if (match) s = match[1];
  return s.replace(/[^a-zA-Z0-9._]/g, '');
}

export async function POST(req: NextRequest) {
  const { username } = await req.json().catch(() => ({ username: '' }));
  const apifyToken = process.env.APIFY_TOKEN;

  if (!apifyToken) {
    return NextResponse.json({ message: '서버 환경변수 APIFY_TOKEN이 설정되지 않았습니다.' }, { status: 500 });
  }

  const cleanUsername = parseUsername(username);
  if (!cleanUsername) {
    return NextResponse.json({ message: '유효한 인스타그램 유저네임을 입력해주세요.' }, { status: 400 });
  }

  const url = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(apifyToken)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [cleanUsername], includeAboutSection: false }),
    cache: 'no-store'
  });

  if (!response.ok) {
    if (response.status === 401) return NextResponse.json({ message: 'Apify 토큰이 유효하지 않습니다.' }, { status: 401 });
    if (response.status === 402) return NextResponse.json({ message: 'Apify 크레딧이 부족합니다.' }, { status: 402 });
    return NextResponse.json({ message: `Apify API 오류: ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json({ message: '계정 데이터를 가져오지 못했습니다. 유저네임을 확인해주세요.' }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}

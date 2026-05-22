'use client';

import { useMemo, useState } from 'react';

type Post = { type?: string; likesCount?: number; commentsCount?: number; videoViewCount?: number; videoPlayCount?: number; caption?: string };
type Profile = {
  username?: string; fullName?: string; biography?: string; followersCount?: number; followsCount?: number; postsCount?: number;
  isBusinessAccount?: boolean; verified?: boolean; highlightReelCount?: number; externalUrl?: string; profilePicUrl?: string; latestPosts?: Post[];
};

const sampleProfile: Profile = {
  username: 'photoclinic_kr',
  fullName: '포토클리닉',
  biography: '사진, 그 이상의 이야기\n브랜드 이미지 컨설팅과 의료 사진 콘텐츠',
  followersCount: 8420,
  followsCount: 178,
  postsCount: 312,
  isBusinessAccount: true,
  verified: false,
  highlightReelCount: 7,
  externalUrl: 'https://photoclinic.co.kr',
  latestPosts: [
    { type: 'Video', likesCount: 628, commentsCount: 31, videoViewCount: 12400, caption: '시술 전후 사진을 신뢰감 있게 보여주는 촬영 방식' },
    { type: 'Sidecar', likesCount: 441, commentsCount: 18, caption: '피부과 상세페이지에 필요한 컷 구성 체크리스트' },
    { type: 'Image', likesCount: 306, commentsCount: 8, caption: '원장님 프로필 촬영 현장' },
    { type: 'Video', likesCount: 584, commentsCount: 27, videoViewCount: 9800, caption: '병원 브랜드 이미지가 첫 상담에 미치는 영향' },
    { type: 'Sidecar', likesCount: 392, commentsCount: 16, caption: '상담 전환을 높이는 인스타그램 피드 구성' },
    { type: 'Video', likesCount: 512, commentsCount: 22, videoViewCount: 8400, caption: '의료진 인터뷰 촬영 비하인드' },
    { type: 'Image', likesCount: 241, commentsCount: 6, caption: '클리닉 공간 촬영 레퍼런스' },
    { type: 'Video', likesCount: 690, commentsCount: 38, videoViewCount: 15100, caption: '환자가 안심하는 사진 톤 만들기' },
    { type: 'Sidecar', likesCount: 365, commentsCount: 12, caption: '병원 인스타그램 운영 점검표' },
    { type: 'Image', likesCount: 218, commentsCount: 4, caption: '진료실 자연광 촬영' }
  ]
};

function number(value?: number) { return Number(value || 0).toLocaleString(); }
function percent(value: number) { return `${value.toFixed(1)}%`; }
function normalizeType(type?: string) { if (type === 'Video' || type === 'Reel') return 'Video'; if (type === 'Sidecar' || type === 'Carousel') return 'Sidecar'; return 'Image'; }
function typeLabel(type?: string) { const t = normalizeType(type); return t === 'Video' ? '릴스/비디오' : t === 'Sidecar' ? '캐러셀' : '단일 이미지'; }
function postEngagement(post: Post) { return (post.likesCount || 0) + (post.commentsCount || 0); }
function clampScore(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }

function useProfileAnalysis(profile: Profile | null) {
  return useMemo(() => {
    if (!profile) return null;
    const posts = Array.isArray(profile.latestPosts) ? profile.latestPosts : [];
    const followers = profile.followersCount || 0;
    const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
    const avgLikes = posts.length ? Math.round(totalLikes / posts.length) : 0;
    const avgComments = posts.length ? Math.round(totalComments / posts.length) : 0;
    const avgEngagement = posts.length ? (totalLikes + totalComments) / posts.length : 0;
    const engagementRate = followers ? (avgEngagement / followers) * 100 : 0;
    const maxViews = posts.reduce((max, p) => Math.max(max, p.videoViewCount || p.videoPlayCount || 0), 0);
    const topPosts = [...posts].sort((a, b) => postEngagement(b) - postEngagement(a)).slice(0, 10);
    const counts = { Video: 0, Sidecar: 0, Image: 0 };
    posts.forEach((p) => { counts[normalizeType(p.type) as keyof typeof counts] += 1; });
    const total = posts.length || 1;
    const videoPercent = Math.round((counts.Video / total) * 100);
    const sidecarPercent = Math.round((counts.Sidecar / total) * 100);
    const imagePercent = Math.round((counts.Image / total) * 100);

    const brandTrust = clampScore(42 + Math.min(18, followers / 600) + (profile.externalUrl ? 12 : 0) + (profile.isBusinessAccount ? 10 : 0) + Math.min(12, (profile.highlightReelCount || 0) * 2));
    const contentPower = clampScore(35 + engagementRate * 12 + videoPercent * 0.25 + sidecarPercent * 0.18 + Math.min(12, avgComments));
    const conversionPath = clampScore(35 + (profile.externalUrl ? 25 : 0) + (profile.highlightReelCount || 0) * 4 + (avgComments >= 8 ? 10 : 0));
    const imageDirection = clampScore(40 + sidecarPercent * 0.22 + videoPercent * 0.18 + (posts.some(p => /원장|의료진|공간|환자|전후|시술|상담/.test(p.caption || '')) ? 18 : 0));
    const totalScore = clampScore((brandTrust + contentPower + conversionPath + imageDirection) / 4);

    const strengths: string[] = [];
    const improvements: string[] = [];
    if (engagementRate >= 3) strengths.push(`최근 게시물 참여율이 ${percent(engagementRate)}로 병원 계정 기준에서 준수합니다. 단순 노출보다 콘텐츠 반응 밀도가 확보되어 있습니다.`);
    else improvements.push(`최근 게시물 참여율이 ${percent(engagementRate)}입니다. 단순 홍보형 게시물보다 저장·공유할 이유가 있는 정보형 콘텐츠를 늘려야 합니다.`);
    if (videoPercent >= 50) strengths.push(`릴스/영상 비중이 ${videoPercent}%로 신규 도달 확장에 유리합니다. 원장 설명형, 공간 무드형, 시술 과정형 콘텐츠로 확장하기 좋습니다.`);
    else improvements.push(`릴스/영상 비중이 ${videoPercent}%입니다. 팔로워 밖 도달을 위해 20~40초 길이의 설명형 릴스를 주 1~2회 고정하는 것이 좋습니다.`);
    if (sidecarPercent >= 30) strengths.push(`캐러셀 비중이 ${sidecarPercent}%로 상담 전 체크리스트, 시술 후 주의사항 같은 저장형 콘텐츠 기반이 있습니다.`);
    else improvements.push(`캐러셀 비중이 ${sidecarPercent}%입니다. 전후 비교, 상담 전 질문, 치료 과정 설명처럼 넘겨보는 정보형 게시물을 보강하세요.`);
    if (profile.externalUrl) strengths.push('프로필 외부 링크가 연결되어 있어 계정 방문 이후 상담·예약으로 이어질 기본 동선이 있습니다.');
    else improvements.push('프로필 외부 링크가 없습니다. 카카오 상담, 예약 페이지, 홈페이지 중 하나로 전환 동선을 먼저 연결해야 합니다.');
    if ((profile.highlightReelCount || 0) >= 6) strengths.push(`하이라이트 ${profile.highlightReelCount}개로 첫 방문자가 병원의 주요 서비스를 탐색할 수 있는 구조가 있습니다.`);
    else improvements.push(`하이라이트가 ${profile.highlightReelCount || 0}개입니다. 진료과목, 의료진, 후기, 오시는 길, 예약 방법을 분리해 신뢰 동선을 만드세요.`);
    if (avgComments < 8) improvements.push(`평균 댓글이 ${avgComments}개입니다. “어떤 점이 가장 궁금하신가요?”처럼 선택형 질문 CTA를 고정 패턴으로 넣어보세요.`);

    const priorities = [
      { title: '의료진 신뢰 콘텐츠 보강', body: '원장님 프로필, 진료 철학, 설명 장면을 고정 시리즈화하면 병원 선택 전 불안을 줄이는 데 도움이 됩니다.' },
      { title: '상담 전환 동선 정리', body: profile.externalUrl ? '현재 링크는 있으므로 게시물 말미 CTA와 하이라이트에서 같은 상담 경로를 반복 노출하세요.' : '프로필 링크부터 연결하고, 게시물·하이라이트·고정 게시물에서 동일한 예약 경로를 반복 노출하세요.' },
      { title: '저장형 캐러셀 + 짧은 릴스 병행', body: `현재 릴스 ${videoPercent}%, 캐러셀 ${sidecarPercent}%입니다. 도달용 릴스와 설득용 캐러셀을 함께 운영해야 상담 전환력이 높아집니다.` }
    ];

    return { posts, followers, avgLikes, avgComments, maxViews, engagementRate, topPosts, counts, videoPercent, sidecarPercent, imagePercent, scores: { brandTrust, contentPower, conversionPath, imageDirection, totalScore }, strengths, improvements, priorities };
  }, [profile]);
}

function explainPost(post: Post) {
  const clues: string[] = [];
  const caption = (post.caption || '').toLowerCase();
  const type = normalizeType(post.type);
  if (type === 'Video') clues.push('영상 형식이라 초반 후킹과 체류 시간 확보에 유리합니다');
  if (type === 'Sidecar') clues.push('여러 장을 넘겨보는 구조라 정보 저장과 비교 이해를 유도합니다');
  if (/전후|before|after/.test(caption)) clues.push('전후 변화처럼 결과가 명확한 주제가 반응을 끌어낸 것으로 보입니다');
  if (/원장|의료진|환자|상담/.test(caption)) clues.push('사람과 신뢰가 드러나는 소재라 병원 계정과 잘 맞습니다');
  if ((post.commentsCount || 0) >= 20) clues.push(`댓글 ${number(post.commentsCount)}개로 질문·공감·상담 전환 신호가 강합니다`);
  if ((post.videoViewCount || post.videoPlayCount || 0) >= 8000) clues.push(`영상 조회수 ${number(post.videoViewCount || post.videoPlayCount)}회로 도달 신호가 좋습니다`);
  return (clues.slice(0, 3).join('. ') || '상위 반응을 만든 구조를 제목, 형식, 소재 단위로 반복 테스트할 가치가 있습니다') + '.';
}


function Avatar({ profile }: { profile: Profile }) {
  const [failed, setFailed] = useState(false);
  const firstLetter = (profile.username || profile.fullName || '?').slice(0, 1).toUpperCase();
  const imageUrl = profile.profilePicUrl && !failed
    ? `/api/image?url=${encodeURIComponent(profile.profilePicUrl)}`
    : '';

  if (!imageUrl) return <div className="avatarFallback">{firstLetter}</div>;
  return <img src={imageUrl} alt={`${profile.username || 'profile'} 프로필 사진`} onError={() => setFailed(true)} />;
}

function EngagementBars({ posts }: { posts: Post[] }) {
  const visiblePosts = posts.slice(0, 6);
  const max = Math.max(1, ...visiblePosts.map(postEngagement));

  if (!visiblePosts.length) {
    return <div className="chartEmpty">최근 게시물 반응 데이터가 없습니다.</div>;
  }

  return <div className="barList" aria-label="상위 게시물 반응">
    {visiblePosts.map((post, index) => {
      const value = postEngagement(post);
      const width = Math.max(8, Math.round((value / max) * 100));
      return <div className="barRow" key={`${post.caption || 'post'}-${index}`}>
        <div className="barLabel">#{index + 1}</div>
        <div className="barTrack"><div className="barFill" style={{ width: `${width}%` }} /></div>
        <div className="barValue">{number(value)}</div>
      </div>;
    })}
  </div>;
}

function TypeBreakdown({ analysis }: { analysis: NonNullable<ReturnType<typeof useProfileAnalysis>> }) {
  const items = [
    { label: '릴스/비디오', value: analysis.counts.Video, percent: analysis.videoPercent },
    { label: '캐러셀', value: analysis.counts.Sidecar, percent: analysis.sidecarPercent },
    { label: '단일 이미지', value: analysis.counts.Image, percent: analysis.imagePercent }
  ];

  return <div className="typeList" aria-label="콘텐츠 타입 비중">
    {items.map((item) => <article className="typeItem" key={item.label}>
      <div className="typeTop"><strong>{item.label}</strong><span>{item.percent}%</span></div>
      <div className="typeTrack"><div className="typeFill" style={{ width: `${Math.max(5, item.percent)}%` }} /></div>
      <p>{item.value}개</p>
    </article>)}
  </div>;
}


export default function Page() {
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<'live' | 'sample'>('live');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const analysis = useProfileAnalysis(profile);

  async function analyze() {
    setError('');
    if (mode === 'sample') { setProfile(sampleProfile); return; }
    if (!username.trim()) { setError('인스타그램 유저네임 또는 URL을 입력해주세요.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '분석 중 오류가 발생했습니다.');
      setProfile(data);
    } catch (e: any) { setError(e.message || '분석 중 오류가 발생했습니다.'); }
    finally { setLoading(false); }
  }

  return <main className="shell">
    <header className="topbar"><div className="brand"><div className="logoMark">PHOTO CLINIC</div><div><div className="brandTitle">포토클리닉 병원 인스타그램 진단 리포트</div><div className="brandSub">Apify 서버 연동 · 병원 브랜딩 관점 자동 리포트</div></div></div><div className="actions noPrint"><button className="btn ghost" onClick={() => window.print()}>PDF 저장</button><button className="btn ghost" onClick={() => { setProfile(null); setUsername(''); }}>초기화</button></div></header>

    <section className="hero noPrint"><div className="heroText"><div className="eyebrow">PHOTOCLINIC SOCIAL DIAGNOSIS</div><h1>계정 숫자를 병원 브랜딩 리포트로 바꿉니다.</h1><p>팔로워·참여율·릴스·캐러셀·댓글 신호를 바탕으로 의료진 신뢰, 이미지 완성도, 상담 전환 동선까지 진단합니다.</p><div className="statusRow"><span className="pill"><span className="dot"/>토큰 서버 보관</span><span className="pill">병원 이미지 진단</span><span className="pill">PDF 리포트 출력</span></div></div><aside className="heroCard"><div className="label">Analyze</div><h2>계정 입력</h2><p className="sub">유저네임, @아이디, 인스타그램 URL 모두 입력할 수 있습니다.</p><div className="stack"><div className="switch"><button className={mode === 'live' ? 'active' : ''} onClick={() => setMode('live')}>실데이터</button><button className={mode === 'sample' ? 'active' : ''} onClick={() => setMode('sample')}>샘플 보기</button></div><input className="field" disabled={mode === 'sample'} placeholder={mode === 'sample' ? '샘플 데이터로 분석합니다' : '예: photoclinic_kr'} value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') analyze(); }} /><button className="btn primary" disabled={loading} onClick={analyze}>{loading ? '분석 중...' : mode === 'sample' ? '샘플 리포트 보기' : '진단 리포트 생성'}</button></div><div className="help">Apify 토큰은 브라우저가 아니라 서버의 <b>APIFY_TOKEN</b> 환경변수로 관리됩니다.</div>{error && <div className="error">{error}</div>}</aside></section>

    <section className="workspace"><aside className="panel noPrint"><div className="label">Reading Guide</div><h2>진단 기준</h2><p>일반 SNS 수치가 아니라 병원 선택 전 신뢰를 만드는 요소로 재해석합니다.</p><ul className="guideList"><li><strong>신뢰</strong>의료진·공간·전문성의 실체가 보이는가</li><li><strong>전환</strong>프로필 방문 이후 상담/예약으로 이어지는가</li><li><strong>이미지</strong>포토클리닉 촬영으로 개선할 여지가 어디인가</li></ul></aside>

      <div>{!profile || !analysis ? <div className="empty">계정을 입력하거나 샘플 보기를 눌러 리포트를 생성하세요.</div> : <div className="results">
        <section className="cover"><div className="coverTop"><div className="logoMark">PHOTO CLINIC</div><div className="eyebrow">Instagram Brand Report</div></div><h2>{profile.fullName || profile.username || '병원'}<br/>인스타그램 이미지 진단 리포트</h2><p>본 리포트는 인스타그램 계정의 최근 콘텐츠 반응을 바탕으로 병원의 신뢰 형성, 브랜드 이미지, 상담 전환 동선을 진단하기 위한 기초 자료입니다. 단순 조회 수보다 환자가 병원을 선택하기 전 느끼는 안심, 전문성, 실체감을 중심으로 해석했습니다.</p><div className="coverMeta"><span>계정: @{profile.username || 'unknown'}</span><span>진단일: {new Date().toLocaleDateString('ko-KR')}</span><span>종합 점수: {analysis.scores.totalScore}점 / 100점</span></div></section>

        <section className="reportBlock"><div className="sectionHead"><div className="label">01 Executive Summary</div><h2>핵심 진단</h2><p>대표원장님 또는 마케팅 담당자가 먼저 확인해야 할 요약입니다.</p></div><div className="grid3">{analysis.priorities.map((p, i) => <article className="scoreCard" key={p.title}><div className="metricLabel">Priority {i + 1}</div><strong>{p.title}</strong><p>{p.body}</p></article>)}</div></section>

        <section className="reportBlock"><div className="sectionHead"><div className="label">02 Brand Scores</div><h2>병원 브랜드 점수</h2><p>수치 기반 데이터를 병원 브랜딩 관점으로 환산한 점수입니다.</p></div><div className="grid4"><article className="scoreCard"><div className="scoreNum">{analysis.scores.brandTrust}</div><strong>브랜드 신뢰도</strong><p>계정 기본 정보와 탐색 동선의 신뢰 수준</p></article><article className="scoreCard"><div className="scoreNum">{analysis.scores.contentPower}</div><strong>콘텐츠 반응도</strong><p>최근 게시물의 반응 밀도와 확산 가능성</p></article><article className="scoreCard"><div className="scoreNum">{analysis.scores.conversionPath}</div><strong>상담 전환 동선</strong><p>프로필 방문 이후 예약/상담 연결 가능성</p></article><article className="scoreCard"><div className="scoreNum">{analysis.scores.imageDirection}</div><strong>이미지 설득력</strong><p>의료진·공간·진료 장면의 브랜딩 적합성</p></article></div></section>

        <section className="reportBlock"><div className="sectionHead"><div className="label">03 Profile</div><h2>계정 개요</h2><p>브랜드 신뢰도와 기본 전환 동선을 확인합니다.</p></div><div className="profile"><div className="avatar"><Avatar profile={profile} /></div><div><h3>{profile.fullName || profile.username || '이름 없음'}</h3><div className="postMeta">@{profile.username || 'unknown'}</div><div className="profileBio">{profile.biography || '소개글이 없습니다.'}</div></div></div><br/><div className="grid4"><article className="metricCard"><div className="metricLabel">Followers</div><div className="metricValue">{number(analysis.followers)}</div><div className="metricSub">팔로워</div></article><article className="metricCard"><div className="metricLabel">Engagement</div><div className="metricValue">{percent(analysis.engagementRate)}</div><div className="metricSub">최근 평균 참여율</div></article><article className="metricCard"><div className="metricLabel">Posts</div><div className="metricValue">{number(profile.postsCount)}</div><div className="metricSub">전체 게시물</div></article><article className="metricCard"><div className="metricLabel">Following</div><div className="metricValue">{number(profile.followsCount)}</div><div className="metricSub">팔로잉</div></article></div></section>

        <section className="reportBlock"><div className="sectionHead"><div className="label">04 Performance</div><h2>콘텐츠 반응과 구성</h2><p>반응이 강했던 콘텐츠와 콘텐츠 타입의 균형을 확인합니다.</p></div><div className="grid2"><article className="metricCard"><h3>상위 게시물 반응</h3><p className="cardSub">좋아요와 댓글을 합산한 참여 수 기준입니다.</p><EngagementBars posts={analysis.topPosts} /></article><article className="metricCard"><h3>콘텐츠 타입 비중</h3><p className="cardSub">최근 게시물 기준 릴스, 캐러셀, 단일 이미지의 분포입니다.</p><TypeBreakdown analysis={analysis} /></article></div></section>

        <section className="reportBlock"><div className="sectionHead"><div className="label">05 Diagnosis</div><h2>강점과 개선 액션</h2><p>다음 콘텐츠 회의와 촬영 제안에 바로 사용할 수 있는 문장으로 정리했습니다.</p></div><div className="grid2"><article><h3>강점</h3><ul className="clean">{analysis.strengths.map((s) => <li key={s}>{s}</li>)}</ul></article><article><h3>개선 액션</h3><ul className="clean">{analysis.improvements.map((s) => <li key={s}>{s}</li>)}</ul></article></div></section>

        <section className="reportBlock"><div className="sectionHead"><div className="label">06 Top Posts</div><h2>상위 게시물 해석</h2><p>좋아요와 댓글 합산 기준 상위 콘텐츠입니다.</p></div><div className="postList">{analysis.topPosts.slice(0,6).map((post, i) => <article className="postItem" key={`${post.caption}-${i}`}><div className="postRow"><div className="rank">#{i+1}</div><div><div className="postTitle">{post.caption || '캡션 없음'}</div><div className="postMeta">{typeLabel(post.type)} · 좋아요 {number(post.likesCount)} · 댓글 {number(post.commentsCount)}</div></div><div className="postScore">{number(postEngagement(post))}<div className="postMeta">참여 수</div></div></div><div className="reason"><strong>왜 반응이 좋았나</strong> {explainPost(post)}</div></article>)}</div></section>

        <section className="reportBlock"><div className="sectionHead"><div className="label">07 PhotoClinic Proposal Direction</div><h2>촬영/콘텐츠 제안 방향</h2><p>분석 결과를 포토클리닉 상담으로 연결하기 위한 제안입니다.</p></div><div className="grid3"><article className="scoreCard"><strong>의료진 프로필</strong><p>전문성과 친밀감을 함께 보여주는 대표원장/의료진 프로필 컷을 우선 보강합니다.</p></article><article className="scoreCard"><strong>진료 연출 장면</strong><p>상담, 설명, 장비 사용, 사후관리 장면을 통해 환자의 불안을 줄이는 증거 이미지를 만듭니다.</p></article><article className="scoreCard"><strong>공간 실체감</strong><p>대기실, 진료실, 장비, 동선 이미지를 정리해 방문 전 신뢰를 높입니다.</p></article></div></section>
      </div>}</div>
    </section><footer className="footer">PHOTOCLINIC Instagram Brand Report · Server-side Apify Token · Print-ready PDF Layout</footer>
  </main>;
}

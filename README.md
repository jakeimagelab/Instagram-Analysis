# 포토클리닉 병원 인스타그램 진단 리포트 v2

기존 단일 `index.html`을 고객용 서비스에 가까운 Next.js/Vercel 구조로 수정한 버전입니다. 이 테스트 버전은 첫 로그인 화면을 제거해 접속 즉시 분석 화면이 열립니다.

## 반영 내용

### 1. 보안 구조 개선
- 기존: HTML 안에 비밀번호와 Apify 토큰 저장 로직 포함
- 수정: 첫 로그인 화면 제거
- `APIFY_TOKEN`은 서버 환경변수로 관리
- 클라이언트에는 Apify 토큰이 노출되지 않습니다.

### 2. 병원용 진단 항목 추가
- 브랜드 신뢰도
- 콘텐츠 반응도
- 상담 전환 동선
- 이미지 설득력
- 의료진/공간/진료 장면 중심 개선 제안

### 3. 고급 리포트 문체 적용
- 단순 SNS 관리 팁이 아니라 병원 대표원장님/마케팅 담당자에게 보여줄 수 있는 컨설팅 리포트 문체로 변경했습니다.

### 4. PDF 리포트 디자인 고급화
- 표지
- 핵심 진단
- 브랜드 점수
- 계정 개요
- 콘텐츠 반응
- 강점/개선 액션
- 상위 게시물 해석
- 포토클리닉 촬영 제안 방향
- `PDF 저장` 버튼은 브라우저 인쇄 기능을 사용합니다. 인쇄창에서 “PDF로 저장”을 선택하세요.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```bash
http://localhost:3000
```

## 환경변수 설정

루트에 `.env.local` 파일을 만들고 아래처럼 입력하세요.

```bash
APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Vercel에 배포할 경우:

1. Vercel 프로젝트 생성
2. Project Settings > Environment Variables 이동
3. `APIFY_TOKEN` 등록
4. 재배포

## 주요 파일

- `app/page.tsx` : 화면, 진단 로직, 리포트 렌더링
- `app/api/analyze/route.ts` : 서버에서 Apify API 호출
- `app/globals.css` : 포토클리닉 브랜드 디자인, PDF 출력 스타일
- `.env.example` : 환경변수 예시

## 참고

이 버전은 실제 서비스화 전 단계의 고급 MVP입니다. 완전한 상용 서비스로 가려면 이후에 아래 기능을 추가하는 것이 좋습니다.

- 관리자 페이지
- 고객별 리포트 저장
- Google Sheet 또는 Supabase 저장
- 리포트 URL 공유 기능
- 실제 PDF 파일 생성 API
- 병원 홈페이지/네이버플레이스/인스타그램 통합 진단

## v2.1 수정 사항

- 프로필 사진이 직접 로드되지 않는 경우를 대비해 `/api/image` 프록시를 추가했습니다.
- 인스타그램 CDN 이미지가 브라우저에서 깨질 때도 서버를 통해 안정적으로 표시되도록 했습니다.
- Chart.js 캔버스 대신 CSS 기반 막대 그래프/비중 그래프로 교체해 Vercel 배포 환경에서도 퍼포먼스 영역이 빈칸으로 나오지 않도록 수정했습니다.


## Vercel 배포 체크

- GitHub 저장소 최상단에 `app`, `package.json`, `next.config.js`, `tsconfig.json`이 바로 보여야 합니다.
- `package-lock.json`은 포함하지 않았습니다. Vercel이 공개 npm 레지스트리에서 새로 설치합니다.
- Vercel 환경변수에는 `APIFY_TOKEN` 하나만 등록하면 됩니다.
- 토큰은 코드에 넣지 마세요. GitHub Secret Scanning에 걸립니다.


## Vercel 배포 오류 대응

Vercel에서 `Vulnerable version of Next.js detected` 오류가 나오지 않도록 Next.js를 `15.5.18`로 업데이트했습니다. GitHub 업로드 후 Vercel에서 Redeploy 하세요.

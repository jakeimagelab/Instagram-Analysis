import './globals.css';

export const metadata = {
  title: '포토클리닉 병원 인스타그램 진단 리포트',
  description: '병원 인스타그램 계정을 분석하고 브랜드 이미지 개선 리포트를 생성합니다.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

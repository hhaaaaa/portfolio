import type { ReactNode } from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '하 현 | Front-End Engineer',
  description: '프론트엔드 개발자 하현의 소개, 기술, 프로젝트와 경력입니다.',
};

export default function KoreanLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/legacy.css`}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

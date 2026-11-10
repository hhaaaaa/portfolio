import type { ReactNode } from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ha Hyun | Front-End Engineer',
  description: 'Ha Hyun’s front-end engineering experience and projects.',
};

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

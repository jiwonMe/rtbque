import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RTBQue - 동기화된 음악 재생',
  description: '여러 사용자가 동시에 음악을 감상할 수 있는 실시간 동기화 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-dark-800 to-dark-950 text-white">
          {children}
        </div>
      </body>
    </html>
  );
} 
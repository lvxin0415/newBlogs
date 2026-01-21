import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ThreeBackground from '@/components/ThreeBackground';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Tech Insights - 现代技术博客',
  description: '探索前端、后端、Web3 和人工智能的前沿技术',
  keywords: 'blog, tech, frontend, backend, web3, AI, programming',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          {/* 3D 背景 */}
          <ThreeBackground />
          
          {/* 主要内容 */}
          <div className="relative z-10">
            <Navigation />
            <main className="min-h-screen pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

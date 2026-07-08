import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '3M QR Studio - AI Artistic QR Code Generator',
  description: 'Generate stunning, artistic AI QR codes with Stable Diffusion and ControlNet. Make your brand scan-worthy.',
  keywords: 'AI QR, QR Code Generator, Stable Diffusion, ControlNet, Artistic QR, SaaS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#020204] text-gray-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

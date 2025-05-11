import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// import { ThemeProvider } from '@/components/theme-provider';
import { LiveKitProvider } from '@/context/livekit-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Five-Zero Industrial IoT Platform',
  description: 'Real-time monitoring and control dashboard for industrial equipment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LiveKitProvider>
          {children}
        </LiveKitProvider>
      </body>
    </html>
  );
}
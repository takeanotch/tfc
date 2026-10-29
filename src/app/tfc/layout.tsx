export const dynamic = 'force-dynamic';

import Navigation from '@/components/Navigation';
import { ThemeProvider } from '@/context/ThemeContext'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <ThemeProvider>
          <Navigation/>
          {children}
        </ThemeProvider>
  )
}

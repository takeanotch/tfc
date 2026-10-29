export const dynamic = 'force-dynamic';

import Navigation from '@/components/Navigation'
import { ThemeProvider } from '@/context/ThemeContext'
export default function ExLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
        <ThemeProvider>

          {children}
        </ThemeProvider>
      
  )
}

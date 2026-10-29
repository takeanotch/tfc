export const dynamic = 'force-dynamic';

import RouteLoader from '@/components/RouteLoader';
import './globals.css'
import { TrackActivity } from '@/components/TrackActivity'
import { ThemeProvider } from '@/context/ThemeContext'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className='dark:from-gray-900 overflow-x-clip dark:to-gray-800'>
        <TrackActivity />
        {/* <RouteLoader /> */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

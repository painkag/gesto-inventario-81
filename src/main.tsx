import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { ErrorBoundary } from '@/providers/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="estoque-theme">
      <QueryProvider>
        <BrowserRouter>
          <App />
          <Toaster />
          <SonnerToaster />
        </BrowserRouter>
      </QueryProvider>
    </ThemeProvider>
  </ErrorBoundary>
)

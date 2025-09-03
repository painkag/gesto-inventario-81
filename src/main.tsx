import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { ErrorBoundary } from '@/providers/error-boundary'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="estoque-theme">
      <QueryProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  </ErrorBoundary>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px' },
          success: { style: { background: '#FFB800', color: 'white' } },
          error: { style: { background: '#FF4B4B', color: 'white' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)

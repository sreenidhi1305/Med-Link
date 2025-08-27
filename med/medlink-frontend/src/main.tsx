import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LiveProvider from './live/LiveProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiveProvider>
      <App />
    </LiveProvider>
  </StrictMode>,
)

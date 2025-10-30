import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <Toaster position="bottom-center" richColors expand />
      <App />
    </>
  </React.StrictMode>
)

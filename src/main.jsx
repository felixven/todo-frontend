import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'


createRoot(document.getElementById('root')).render(//呼應index.html div裡面的root
  <StrictMode>
    <App />
  </StrictMode>,
)

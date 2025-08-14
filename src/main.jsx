import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
//main.jsx is a main entry point for React application

createRoot(document.getElementById('root')).render(//呼應index.html div裡面的root
  <StrictMode>
    <App />
  </StrictMode>,
)

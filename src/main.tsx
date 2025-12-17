import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from "sonner";
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <App />
      <Toaster
        richColors
        position="top-right"
        duration={4000}
        closeButton
      />
    </BrowserRouter>
)

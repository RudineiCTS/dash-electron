import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@shared/context/ThemeContext'
import App from './App'
import { sessaoAuth } from './auth/authAdapter'
import { UsuarioProvider } from './auth/UsuarioContext'
import { configureHttp } from './lib/http'
import './styles.css'

configureHttp(sessaoAuth)

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <UsuarioProvider>
      <App />
    </UsuarioProvider>
  </ThemeProvider>,
)

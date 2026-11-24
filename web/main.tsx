import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@shared/context/ThemeContext'
import App from './App'
import { sessionAuth } from './auth/authAdapter'
import { AuthProvider } from './auth/AuthContext'
import { UsuarioProvider } from './auth/UsuarioContext'
import { configureHttp } from './lib/http'
import './styles.css'

// O token da sessão vai em todas as chamadas à API e um 401 encerra a sessão (volta para /login).
configureHttp(sessionAuth)

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <AuthProvider>
      <UsuarioProvider>
        <App />
      </UsuarioProvider>
    </AuthProvider>
  </ThemeProvider>,
)

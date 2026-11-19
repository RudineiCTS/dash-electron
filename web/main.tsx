import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@shared/context/ThemeContext'
import App from './App'
import { anonymousAuth } from './auth/authAdapter'
import { UsuarioProvider } from './auth/UsuarioContext'
import { configureHttp } from './lib/http'
import './styles.css'

// TODO(auth): trocar `anonymousAuth` pela implementação real quando a autenticação for definida.
configureHttp(anonymousAuth)

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <UsuarioProvider>
      <App />
    </UsuarioProvider>
  </ThemeProvider>,
)

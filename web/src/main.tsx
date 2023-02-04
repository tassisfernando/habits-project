import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

/**
 * TODO 
 * => Autenticação (Firebase, Auth0)
 * => Notificações Push (mobile) / Service Workers (Web)
 * => Perfil público com gráfico de resumo 
 * => Deploy da aplicação
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {GoogleOAuthProvider} from '@react-oauth/google'
import AppConfig from './AppConfig'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={AppConfig.googleClientId}>
        <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

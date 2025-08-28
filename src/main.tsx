import React from 'react'
import ReactDOM from 'react-dom/client'
import EnhancedApp from './EnhancedApp.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <EnhancedApp />
    </React.StrictMode>,
)
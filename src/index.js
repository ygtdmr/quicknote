import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './sass/index.sass'
import './sass/responsive.sass'
import './sass/animations.sass'
import './sass/tools.sass'
import './tools/fix'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
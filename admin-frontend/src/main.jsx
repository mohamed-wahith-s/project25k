import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ApiProvider } from './context/ApiContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApiProvider>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </ApiProvider>
  </React.StrictMode>,
);

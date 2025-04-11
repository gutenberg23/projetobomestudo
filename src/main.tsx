import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { inicializarStorageBuckets } from './lib/supabase';

// Inicializar os buckets de storage para uploads temporários
inicializarStorageBuckets().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import './lib/process-polyfill.js';
import './lib/next-router-shim.js';

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

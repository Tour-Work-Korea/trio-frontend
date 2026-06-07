import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '@trio/app/App.web';
import './fonts.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

import React from 'react';
import {createRoot} from 'react-dom/client';
import TripsApp from './TripsApp.jsx';
import './trips.css';

document.documentElement.dataset.trips = 'true';
document.documentElement.lang = 'ko';
createRoot(document.getElementById('root')).render(<TripsApp />);

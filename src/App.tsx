import './App.css'
import React, { useEffect } from 'react';
import MapboxLayout from "./components/MapboxLayout.js";
import { isSafari } from "./lib/safari-polyfills.js";


const API_BASE = '';// use relative proxy
const DEFAULT_PASSPORT_TYPE = 'TR-ORDINARY'; // updated to hyphen format

function App() {
  useEffect(() => {
    // Safari-specific initialization
    if (isSafari()) {
      console.log('Running in Safari - applying Safari-specific fixes');
      
      // Add Safari-specific meta tags if needed
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
    // Initial (optional) preload
    fetch(`/nomad/api/v1/getMapDetail?passport_type=${DEFAULT_PASSPORT_TYPE}`)
      .then(res => res.json())
      .then(data => {
        console.log('Map data at app start:', data);
      })
      .catch(err => {
        console.error('Failed to fetch map data at app start:', err);
      });
  }, []);

  return <MapboxLayout />;
}

export default App

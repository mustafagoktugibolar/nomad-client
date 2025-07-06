import './App.css'
import React, { useEffect } from 'react';
import MapboxLayout from "./components/MapboxLayout.js";
import { isSafari } from "./lib/safari-polyfills.js";


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
    // Fetch map data at application start
    fetch('/api/nomad/api/v1/getMapDetail?passport_type=TR_ORDINARY')
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

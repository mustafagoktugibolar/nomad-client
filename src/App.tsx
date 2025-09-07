import './App.css'
import React, { useEffect } from 'react';
import MapboxLayout from "./components/MapboxLayout.js";
import { isSafari } from "./lib/safari-polyfills.js";
import { useMapDataStore } from "./components/store/mapDataStore.js";


function App() {
  const fetchMapData = useMapDataStore((state) => state.fetchMapData);

  useEffect(() => {
    // Safari-specific initialization
    if (isSafari()) { 
      // Add Safari-specific meta tags if needed
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
    
    // Fetch map data at application start using the store
    fetchMapData();
  }, [fetchMapData]);

  return <MapboxLayout />;
}

export default App

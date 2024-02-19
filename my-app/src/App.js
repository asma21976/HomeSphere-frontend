import React, { useState } from 'react';
import './App.css';

function App() {
  const [mapData, setMapData] = useState(null);

  const fetchMapData = async (mapType) => {
    try {
      const response = await fetch(`http://localhost:5000/api/${mapType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMapData(data);
    } catch (error) {
      console.error(`Fetch failed: ${error}`);
    }
  };  

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-name">
          <h1>HomeSphere</h1>
        </div>
        <div className="App-options">
          <div className="App-subheader">
            <p>Navigating Tomorrow's Housing Landscape, Today</p>
          </div>
          <div className="App-paragraph">
            <p>Choose your map!</p>
          </div>
          <button onClick={() => fetchMapData('congestion_map')}>Congestion Map</button>
          <button onClick={() => fetchMapData('house_price_map')}>House Price Map</button>
          <button onClick={() => fetchMapData('accessibility')}>Accessibility</button>
          <button onClick={() => fetchMapData('housing_development_zone')}>Housing Development Zone</button>
        </div>
      </header>
      {/* Render the map data here */}
      {mapData && <div>{JSON.stringify(mapData)}</div>}
    </div>
  );
}

export default Home;

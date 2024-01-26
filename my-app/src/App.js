import React from 'react';
// import './pages/styles/home.css';

function Home() {
  // const [mapData, setMapData] = useState(null);

  const handleButtonClick = async (mapType) => {
    try {
      const response = await fetch(`http://localhost:5000/api/${mapType}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // setMapData(data);
    } catch (error) {
      console.error('Error fetching map data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* ... (your existing code) */}
        <button onClick={() => handleButtonClick('community_vacancy')}>Community Vacancy</button>
        <button onClick={() => handleButtonClick('congestion_map')}>Congestion Map</button>
        <button onClick={() => handleButtonClick('house_price_map')}>House Price Map</button>
        <button onClick={() => handleButtonClick('accessibility_map')}>Accessibility</button>
        <button onClick={() => handleButtonClick('housing_development_zone_map')}>Housing Development Zone</button>
        {/* ... (your existing code) */}
      </header>
    </div>
  );
}

export default Home;

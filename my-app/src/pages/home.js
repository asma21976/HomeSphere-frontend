import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/home.css';

function Home() {
  const navigate = useNavigate();

  const handleButtonClick = async (mapType) => {
    try {
        const response = await fetch(`http://localhost:3000/api/community_vacancy`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Example navigation to '/map' - Adjust this based on your route setup
      navigate('/map');
    } catch (error) {
      console.error('Error fetching map data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => handleButtonClick('community_vacancy')}>Community Vacancy</button>
        {/* ... (other buttons) */}
      </header>
    </div>
  );
}

export default Home;

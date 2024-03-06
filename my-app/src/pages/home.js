import React from 'react';
import { Link } from 'react-router-dom'
import './styles/home.css';

function Home() {
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
          <Link to="/maps/vacancy_per_community">
            <button>Community Vacancy</button>
          </Link>
          <Link to="/maps/congestion">
            <button>Congestion Map</button>
          </Link>
          <Link to="/maps/property_value_per_community">
            <button>House Price Map</button>
          </Link>
          <Link to="/maps/housing_development_zone">
            <button>Housing Development Zone</button>
          </Link>
        </div>
      </header>
    </div>
  );
}

export default Home;

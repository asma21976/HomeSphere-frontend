import React from "react";
import { Link } from "react-router-dom";
import "./styles/home.css";

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-name">
          <h1>HomeSphere</h1>
        </div>
      </header>
      <body>
        <div className="center-content">
          <h1 className="slogan"> Shaping Calgary's Future: </h1>
          <Link to="/maps/congestion_map">
            <button className="get-started">Get Started</button>
          </Link>
        </div>
      </body>
    </div>
  );
}

export default Home;

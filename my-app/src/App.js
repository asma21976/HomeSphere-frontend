// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <div className="App-name">
//           <h1>HomeSphere</h1>
//         </div>
//         <div className="App-options">
//           <div className="App-subheader">
//             <p1>Navigating Tomorrow's Housing Landscape, Today</p1>
//           </div>
//           <div className="App-paragraph">
//             <p1>Choose your map!</p1>
//           </div>
//           <button>Congestion Map</button>
//           <button>House Price Map</button>
//           <button>Accessibility</button>
//           <button>Housing Develeopment Zone</button>
//         </div>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import './App.css';

function App() {
  const [mapData, setMapData] = useState(null);

  const fetchMapData = async (mapType) => {
    const response = await fetch(`http://localhost:5000/api/${mapType}`);
    const data = await response.json();
    setMapData(data);
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
          <button onClick={() => fetchMapData('community_vacancy')}>Community Vacancy</button>
          <button onClick={() => fetchMapData('congestion_map')}>Congestion Map</button>
          <button onClick={() => fetchMapData('house_price_map')}>House Price Map</button>
          <button onClick={() => fetchMapData('accessibility')}>Accessibility</button>
          <button onClick={() => fetchMapData('housing_development_zone')}>Housing Development Zone</button>
        </div>
      </header>
    </div>
  );
}

export default App;


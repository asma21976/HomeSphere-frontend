import Plot from 'react-plotly.js';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Maps() {
	const { mapType } = useParams();
	const [mapData, setMapData] = useState(null);

	useEffect (() => {
			fetch(`http://localhost:5000/api/${mapType}`)
			.then(data => data.json())
			.then(data => 
			{
				setMapData(JSON.parse(data));
			})
			.catch(err => console.error("Err:", err));
	}, [mapType]);

	return (
    <div>
      {mapData && <Plot data={mapData.data} layout={mapData.layout} />}
    </div>
  );
}

export default Maps;
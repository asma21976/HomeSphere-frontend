import Plot from "react-plotly.js";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Maps() {
  const { mapType } = useParams();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Replaced with fastAPI endpoint
    fetch(`https://home-sphere.ca/api/maps/${mapType}`, {
      headers: {
        'AccessToken': '<Kvwf<IQ5qV]nlPooW@>'
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      setMapData(data);
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [mapType]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {mapData && <Plot data={mapData.data} layout={mapData.layout} />}
    </div>
  );
}

export default Maps;

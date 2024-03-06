import React, { useRef, useEffect, useState } from "react";
// import Plot from "react-plotly.js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function CommunityVacancy() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(10);
  let mapData;

  mapboxgl.accessToken =
    "pk.eyJ1Ijoia2FhamJvbGFuZCIsImEiOiJjbG5kejg0emIwOGRyMmxsZW9vaXYyMGswIn0.Rhnj7A5aOZh0JBebF4WaFQ";

  useEffect(() => {
    fetch("http://localhost:5000/api/community_vacancy")
      .then((response) => response.json())
      .then((data) => {
        mapData = {
          type: "FeatureCollection",
          features: data.buildingPermits.map((permit) => ({
            type: "Feature",
            properties: { ...permit },
            geometry: {
              type: "Point",
              coordinates: [
                parseFloat(permit.longitude),
                parseFloat(permit.latitude),
              ],
            },
          })),
        };
      })
      .catch((error) => console.error("Failed to fetch data:", error));

    // console log data
    console.log(mapData);

    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-114.0719, 51.0447],
      zoom: zoom,
    });

    map.current.on("load", () => {
      map.current.addSource("vacancy_map", {
        type: "geojson",
        data: mapData,
      });

      map.current.addLayer({
        id: "vacancy-map-points",
        type: "fill",
        source: "vacancy_map",
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.5,
        },
      });

      map.current.on("mouseenter", "vacancy-map-points", (e) => {
        map.current.getCanvas().style.cursor = "pointer";
        // Implement popup or UI element to display hover information
      });
    });
  });

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default CommunityVacancy;

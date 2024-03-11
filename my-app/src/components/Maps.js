import Plot from "react-plotly.js";
import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "./styles/Maps.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightDots,
  faDollarSign,
  faScroll,
  faMapMarkerAlt,
  faSquarePollVertical,
  faBars,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";

function Maps() {
  const { mapType } = useParams();
  const [mapData, setMapData] = useState(null);
  const location = useLocation();
  const [showMLWindow, setShowMLWindow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isSelected = (pathSegment) => {
    const currentPath = location.pathname.split("/").pop();
    return currentPath === pathSegment;
  };

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMLWindow = () => {
    setShowMLWindow(!showMLWindow);
  };
  function valuetext(value) {
    return `${value}°C`;
  }

  useEffect(() => {
    fetch(`https://home-sphere.ca/api/maps/${mapType}`, {
      headers: {
        'AccessToken': 'Kvwf<IQ5qV]nlPooW@'
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
      });
  }, [mapType]);

  console.log(mapData);
  return (
    <div className="container">
      <div id="sidebar" className={`sidebar ${collapsed ? "short" : ""}`}>
        <div id="buttons-container">
          <Link to="/maps/congestion">
            <button
              id="population-button"
              className={`menu-button ${
                isSelected("congestion") ? "selected" : "map-feature-button"
              }`}
            >
              <FontAwesomeIcon
                icon={faArrowUpRightDots}
                title="Community Population"
                className="fa-svg-icon"
              />
              <p>Population</p>
            </button>
          </Link>
          {/* Other menu buttons */}
        </div>
      </div>
      <div id="content">
        <div id="mapContainer" className="mapContainer">
          {mapData && (
            <Plot
              data={mapData.data}
              layout={mapData.layout}
              useResizeHandler={true}
              style={{ width: "100%", height: "80vh" }} // Adjust map height as needed
              responsive={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Maps;

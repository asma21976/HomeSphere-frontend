import Plot from "react-plotly.js";
import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "../components/styles/Maps.css";
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
  const location = useLocation();
  const [showMLWindow, setShowMLWindow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const communityFeatures = {
    "Demographic and Socioeconomic Indicators": [
      "Count of Population in Private Households",
      "Median Household Income",
      "Count of Population Considered Low Income",
      "Count of Private Households",
      "Count of Owner Households",
      "Count of Renter Households",
      "Count of Private Households With Income",
      "Count of Households with Less Than 30 Pct of Total Income on Shelter",
      "Count of Households with More Than 30 Pct of Total Income on Shelter",
      "Median Owner Monthly Shelter Cost",
      "Median Renter Monthly Shelter Cost",
    ],
    "Housing Composition Condition": [
      "Count of Households That Require Regular Maintenance Or Minor Repairs",
      "Count of Households That Require Major Repairs",
      "Count of Suitable Households",
      "Count of Unsuitable Households",
    ],
    "Crime And Disorder": [
      "Crime Count of Prior Year",
      "Physical and Social Disorder Count of Prior Year",
    ],
  };

  const postalFeatures = {
    PropertyAssessments: ["MedianAssessedValue", "MedianLandSize"],
    Schools: [
      "NearestElementarySchool",
      "NearestJuniorHighSchool",
      "NearestSeniorHighSchool",
      "SchoolCountWithin1KM",
    ],
    CommunityServices: [
      "NearestCommunityCentre",
      "NearestAttraction",
      "NearestVisitorInformationCentre",
      "NearestSocialDevelopmentCentre",
      "ServicesCountWithin1KM",
    ],
    Amenities: [
      "NearestHospital",
      "NearestLibrary",
      "NearestPHSClinic",
      "NearestCourt",
    ],
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

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
      setError(err.message);
      setMapData(null);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [mapType]);

  console.log(mapData);

  return (
    <div>
      <div id="homeBar" className="homeBar">
        <h1>
          <FontAwesomeIcon
            icon={faBars}
            className="hamburger"
            onClick={handleToggleSidebar}
          />
          HOMESPHERE
        </h1>
      </div>
      <div id="sidebar" className={`sidebar ${collapsed ? "short" : ""}`}>
        <div id="buttons-container">
          <Link to="/maps/congestion_map">
            <button
              id="population-button"
              className={`menu-button ${
                isSelected("congestion_map") ? "selected" : "map-feature-button"
              }`}
            >
              <FontAwesomeIcon
                icon={faArrowUpRightDots}
                title="Community Population"
                className="fa-svg-icon"
              />
              <p>Population</p>
              {/* Congestion */}
            </button>
          </Link>
          <Link to="/maps/community_vacancy">
            <button
              id="vacancy-button"
              className={`menu-button ${
                isSelected("community_vacancy")
                  ? "selected"
                  : "map-feature-button"
              }`}
            >
              {/* Community  */}
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                title="Land Vacancy"
                className="fa-svg-icon"
              />
              <p>Vacancy</p>
            </button>
          </Link>
          <Link to="/maps/housing_development_zone">
            <button
              id="permits-button"
              className={`menu-button ${
                isSelected("housing_development_zone")
                  ? "selected"
                  : "map-feature-button"
              }`}
            >
              {/* Urban  */}
              <FontAwesomeIcon
                icon={faScroll}
                title="Building Permits"
                className="fa-svg-icon"
              />
              <p>Permits</p>
            </button>
          </Link>
          <Link to="/maps/house_price_map">
            <button
              id="pricing-button"
              className={`menu-button ${
                isSelected("house_price_map")
                  ? "selected"
                  : "map-feature-button"
              }`}
            >
              <FontAwesomeIcon
                icon={faDollarSign}
                title="House Prices"
                className="fa-svg-icon"
              />
              <p>House Prices</p>
            </button>
          </Link>
          <button
            id="machine-learning-button"
            className={`menu-button ${
              isSelected("house_price_map") ? "selected" : "map-feature-button"
            }`}
            onClick={toggleMLWindow}
          >
            <FontAwesomeIcon
              icon={faSquarePollVertical}
              title="Machine Learning Housing Analaysis"
              className="fa-svg-icon"
            />
            <p>Housing Analysis</p>
          </button>
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      <div id="mapContainer">
        {mapData && (
          <Plot
            data={mapData.data}
            layout={mapData.layout}
            useResizeHandler={true}
            style={{ width: "100%", height: "100vh" }}
            responsive={true}
          />
        )}
      </div>
      <div
        id="machine-learning-window"
        className={`${showMLWindow ? "machine-learning-window " : "hidden"}`}
      >
        {/* Machine learning window content */}
        <button type="button" class="cancelML" onClick={toggleMLWindow}>
          X
        </button>
        <p className="disclaimer">
          Disclaimer: Please not that our housing analysis system focuses
          exclusively on the northeast scope of Calgary and offers a broad
          estimation of housing and community analytics based on data sources
          from the City of Calgary. This information must not be regarded as
          definitive and should only serve as a guide and support for developers
          and residents.
        </p>
        <h2>Select Analysis Criteria</h2>
        <div
          id="features"
          className="features"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            width: "97%",
          }}
        >
          {Object.entries(communityFeatures).map(([key, values], index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <h3>{key}</h3>
              {values.map((value, valueIndex) => (
                <div key={valueIndex} style={{ margin: "5px 0" }}>
                  <input
                    type="checkbox"
                    id={`${key}_${valueIndex}`}
                    name={value}
                  />
                  <label htmlFor={`${key}_${valueIndex}`}>{value}</label>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div id="slider" className="slider">
          <Box sx={{ width: 200 }}>
            <Slider
              defaultValue={3}
              getAriaValueText={valuetext}
              valueLabelDisplay="auto"
              shiftStep={1}
              step={1}
              min={1}
              max={30}
              className="slider-component"
            />
          </Box>
        </div>

        <button type="submit">Run</button>
      </div>
    </div>
  );
}

export default Maps;

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
  const [lastButtonExpanded, setLastButtonExpanded] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapseLeft, setCollapseLeft] = useState(false);
  const [selectedMLOption, setSelectedMLOption] = useState("community-level");

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

  const handleLastButtonToggle = () => {
    setLastButtonExpanded(!lastButtonExpanded);
  };

  function valuetext(value) {
    return `${value}°C`;
  }

  const handleMLOptionChange = (event) => {
    console.log("New ML option selected:", event.target.value); // Debugging

    setSelectedMLOption(event.target.value);
  };

  function getFeatures() {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;
    return Object.entries(features).map(([key, values], index) => (
      <div key={index}>
        <h3>{key}</h3>
        {values.map((value, valueIndex) => (
          <div
            className="machine-learning-window_boxes"
            key={valueIndex}
            style={{ margin: "5px 0" }}
          >
            <input type="checkbox" id={`${key}_${valueIndex}`} name={value} />
            <label htmlFor={`${key}_${valueIndex}`}>{value}</label>
          </div>
        ))}
      </div>
    ));
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
    "Property Assessments": ["Median Assessed Value", "Median Land Size"],
    Schools: [
      "Nearest Elementary School",
      "Nearest Junior-Highschool",
      "Nearest Senior-High School",
      "School Coun tWithin 1KM",
    ],
    "Community Services": [
      "Nearest Community Centre",
      "Nearest Attraction",
      "Nearest Visitor Information Centre",
      "Nearest Social Development Centre",
      "Services Count Within 1KM",
    ],
    Amenities: [
      "Nearest Hospital",
      "Nearest Library",
      "Nearest PHS Clinic",
      "Nearest Court",
    ],
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMapData(null);

    fetch(`https://home-sphere.ca/api/maps/${mapType}`, {
      headers: {
        AccessToken: "Kvwf<IQ5qV]nlPooW@",
      },
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
      <div
        id="sidebar"
        className={`sidebar ${!lastButtonExpanded ? "shortened" : ""} ${
          collapseLeft ? "hidden" : ""
        }`}
      >
        <div className="HomeSphere-Title">
          <h1>HOMESPHERE</h1>
        </div>
        {/* <div className="close-sidebar-btn" onClick={handleToggleSidebar}>
        <button type="button">X</button>
      </div> */}
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
            </button>
          </Link>
          <Link to="/maps/vacancy_per_community">
            <button
              id="vacancy-button"
              className={`menu-button ${
                isSelected("vacancy_per_community")
                  ? "selected"
                  : "map-feature-button"
              }`}
            >
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                title="Land Vacancy"
                className="fa-svg-icon"
              />
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
              <FontAwesomeIcon
                icon={faScroll}
                title="Building Permits"
                className="fa-svg-icon"
              />
            </button>
          </Link>
          <Link to="/maps/property_value_per_community">
            <button
              id="pricing-button"
              className={`menu-button ${
                isSelected("property_value_per_community")
                  ? "selected"
                  : "map-feature-button"
              }`}
            >
              <FontAwesomeIcon
                icon={faDollarSign}
                title="House Prices"
                className="fa-svg-icon"
              />
            </button>
          </Link>
          <button
            id="machine-learning-button"
            className={`menu-button ${
              isSelected("house_price_map") ? "selected" : "map-feature-button"
            }`}
            onClick={() => {
              toggleMLWindow();
              handleLastButtonToggle();
            }}
          >
            <FontAwesomeIcon
              icon={faSquarePollVertical}
              title="Machine Learning Housing Analysis"
              className="fa-svg-icon"
            />
          </button>
        </div>
        <div
          id="machine-learning-window"
          className={`${showMLWindow ? "machine-learning-window " : "hidden"}`}
        >
          <form>
            <p>
              <input
                type="radio"
                id="community-level-option"
                name="ml-options"
                value="communnity-level"
                checked={selectedMLOption === "community-level"}
                onChange={handleMLOptionChange}
              />
              <label for="community-level-option">Community Level</label>
            </p>

            <p>
              <input
                type="radio"
                id="postal-code-level-option"
                name="ml-options"
                value="postal-code-level"
                checked={selectedMLOption === "postal-code-level"}
                onChange={handleMLOptionChange}
              />
              <label for="postal-code-level-option">Sub-Community Level</label>
            </p>
          </form>
          <div id="slider" className="slider">
            <h3>Number of categories:</h3>
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
          <div>{getFeatures()}</div>
          <div id="ml-run-btn" className="ml-run-btn">
            <button> Run</button>
          </div>
        </div>
      </div>
      <div className={showMLWindow ? "collapse-expand-left-btn" : "hidden"}>
        <button
          onClick={() => setCollapseLeft(!collapseLeft)}
          className={`collapse-expand-left-btn ${
            collapseLeft ? "collapse-expand-right-btn" : ""
          }`}
        >
          <img
            src="https://maps.gstatic.com/tactile/pane/arrow_left_2x.png"
            className={`sidebar-btn ${collapseLeft ? "right-btn" : ""}`}
            alt="Toggle Sidebar"
          />
        </button>
      </div>
      {loading && <div className="screen-message">Loading...</div>}
      {error && (
        <div className="screen-message">
          <p>{error}</p>
        </div>
      )}
      <div
        id="mapContainer"
        key={collapsed ? "short" : "full"}
        className={`mapContainer ${collapsed ? "shortMap" : ""}`}
      >
        {mapData && (
          <Plot
            data={mapData.data}
            layout={mapData.layout}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            responsive={true}
          />
        )}
      </div>
    </div>
  );
}

export default Maps;

/*
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
*/

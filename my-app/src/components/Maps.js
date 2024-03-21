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
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
    console.log("New ML option selected:", event.target.value);

    setSelectedMLOption(event.target.value);
  };

  const isChecked = (event) => {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;
    const isChecked = event.target.checked;
    const key = event.target.id;
    if (isChecked) {
      features[key] = true;
    } else if (!isChecked) {
      features[key] = false;
    }

    console.log(features);
    console.log(key);
  };

  const clusterCount = (event) => {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;
    const numClusters = event.target.value;
    features.n_clusters = numClusters;

    console.log(features);
    console.log(numClusters);
  };

  function getFeatures() {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;
    return Object.entries(features)
      .slice(0, -2)
      .map(([feature]) => (
        <div key={feature} style={{ margin: 5 }}>
          <input type="checkbox" id={feature} onChange={isChecked} />
          <label htmlFor={feature}>
            {feature
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
        </div>
      ));
  }

  function runML() {
    const mlType =
      selectedMLOption === "community-level"
        ? "kmeans_community"
        : "kmeans_postal";

    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;

    // This variable is now scoped to runML and can be accessed within nested functions.
    let mapData = null;

    fetch(`https://home-sphere.ca/api/api/${mlType}`, {
      method: "POST",
      headers: {
        AccessToken: "Kvwf<IQ5qV]nlPooW@",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(features),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok at all");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        mapData = data; // Directly assign to the scoped variable without `this`.

        // Initialize the map inside the then block to ensure mapData is loaded.
        mapboxgl.accessToken =
          "pk.eyJ1Ijoia2FhamJvbGFuZCIsImEiOiJjbG5kejg0emIwOGRyMmxsZW9vaXYyMGswIn0.Rhnj7A5aOZh0JBebF4WaFQ";

        let map = new mapboxgl.Map({
          container: "featureMap",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-98.5795, 39.8283],
          zoom: 3,
        });

        map.on("load", function () {
          // Use mapData directly here, as it's now properly scoped and assigned.
          map.addSource("regions", {
            type: "geojson",
            data: mapData,
          });
        });
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        // Assume setError and setMapData are defined elsewhere to handle errors and state.
        setError(err.message);
        setMapData(null);
      })
      .finally(() => {
        // Assuming setLoading is defined elsewhere to handle loading state.
        setLoading(false);
      });
  }

  const communityFeatures = {
    count_of_population_in_private_households: false,
    median_household_income: false,
    count_of_population_considered_low_income: false,
    count_of_private_households: false,
    count_of_owner_households: false,
    count_of_renter_households: false,
    count_of_private_households_with_income: false,
    count_of_households_with_lt_30_pct_of_total_income_on_shelter: false,
    count_of_households_with_gt_30_pct_of_total_income_on_shelter: false,
    median_owner_monthly_shelter_cost: false,
    median_renter_monthly_shelter_cost: false,
    count_of_households_that_require_maintenance: false,
    count_of_households_that_require_major_repairs: false,
    count_of_suitable_households: false,
    count_of_unsuitable_households: false,
    community_crime_count: false,
    community_disorder_count: false,
    n_clusters: 3,
    random_state: 42,
  };
  // {
  //   "Demographic and Socioeconomic Indicators": [
  //     "Count of Population in Private Households",
  //     "Median Household Income",
  //     "Count of Population Considered Low Income",
  //     "Count of Private Households",
  //     "Count of Owner Households",
  //     "Count of Renter Households",
  //     "Count of Private Households With Income",
  //     "Count of Households with Less Than 30 Pct of Total Income on Shelter",
  //     "Count of Households with More Than 30 Pct of Total Income on Shelter",
  //     "Median Owner Monthly Shelter Cost",
  //     "Median Renter Monthly Shelter Cost",
  //   ],
  //   "Housing Composition Condition": [
  //     "Count of Households That Require Regular Maintenance Or Minor Repairs",
  //     "Count of Households That Require Major Repairs",
  //     "Count of Suitable Households",
  //     "Count of Unsuitable Households",
  //   ],
  //   "Crime And Disorder": [
  //     "Crime Count of Prior Year",
  //     "Physical and Social Disorder Count of Prior Year",
  //   ],
  // };

  const postalFeatures = {
    "Property Assessments": ["Median Assessed Value", "Median Land Size"],
    Schools: [
      "Nearest Elementary School",
      "Nearest Junior-Highschool",
      "Nearest Senior-High School",
      "School Count Within 1KM",
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
        data.layout = {
          ...data.layout,
          margin: { l: 0, r: 0, t: 0, b: 0 },
          title: "",
          coloraxis: {
            ...data.layout.coloraxis,
            colorbar: {
              ...data.layout.coloraxis.colorbar,
              xanchor: "right",
              yanchor: "middle",

              thickness: 10,
              x: 0.99,
              y: 0.5,
              len: 0.8,
              width: 0.1,
              title: {
                ...data.layout.coloraxis.colorbar.title,
                side: "right",
                font: {
                  family: "Arial Black",
                  size: 14,
                },
              },
            },
            colorscale: "Rainbow",
          },
          mapbox: {
            ...data.layout.mapbox,
            zoom: 11,
          },
        };
        setMapData(data);
        console.log(data);
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
      <div
        id="sidebar"
        className={`sidebar ${!lastButtonExpanded ? "shortened" : ""} ${
          collapseLeft ? "hidden" : ""
        }`}
      >
        <div className="HomeSphere-Title">
          <h1>HOMESPHERE</h1>
        </div>
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
                value="community-level"
                checked={selectedMLOption === "community-level"}
                onChange={handleMLOptionChange}
              />
              <label htmlFor="community-level-option">Community Level</label>
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
              <label htmlFor="postal-code-level-option">
                Sub-Community Level
              </label>
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
                onChange={clusterCount}
              />
            </Box>
          </div>
          <div>{getFeatures()}</div>
          <div id="ml-run-btn" className="ml-run-btn">
            <button onClick={runML}> Run</button>
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
        id="featureMap"
        style={{
          height: "100vh",
        }}
      >
        {mapData && (
          <Plot
            data={mapData.data}
            layout={mapData.layout}
            useResizeHandler={true}
            style={{ width: "100%", height: "99%" }}
            responsive={true}
          />
        )}
      </div>
    </div>
  );
}

export default Maps;

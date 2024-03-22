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
  faCaretDown,
  faBars,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";

const Sidebar = () => {
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

  function getHeader(feature) {
    for (const header in headerSections) {
      if (headerSections[header][0] === feature) {
        return <h3 key={header}>{header}</h3>;
      }
    }
    return null;
  }

  function getFeatures() {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;
    return Object.entries(features)
      .slice(0, -2)
      .map(([feature]) => (
        <React.Fragment>
          {getHeader(feature)}
          <div key={feature} className="checkbox-container">
            <input type="checkbox" id={feature} onChange={isChecked} />
            <label htmlFor={feature} className="checkbox-label">
              {feature
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
                .replace(/ Pct/, "%")
                .replace(/Gt/, "Greater Than")
                .replace(/Lt/, "Less Than")
                .replace(/Income On/, "Income Spent On")
                .replace(/Dev Centre/, "Development Centre")
                .replace(/Phs Clinic/, "PHS Clinic")}
            </label>
          </div>
        </React.Fragment>
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
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        fetch(`https://home-sphere.ca/api/api/${mlType}_info`, {
          method: "POST",
          headers: {
            AccessToken: "Kvwf<IQ5qV]nlPooW@",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(features),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((mlTypeInfo) => {
            console.log(mlTypeInfo);

            printResults(mlTypeInfo, mlType);
          })
          .catch((err) => {
            console.error("Error fetching mlType_info:", err);
          });

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
            center: {
              lat: 51.115,
              lon: -113.954,
            },
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

    // fetch(`https://home-sphere.ca/api/api/${mlType}`, {
    //   method: "POST",
    //   headers: {
    //     AccessToken: "Kvwf<IQ5qV]nlPooW@",
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(features),
    // })
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }
    //     return response.json();
    //   })
    //   .then((data) => {
    //     data.layout = {
    //       ...data.layout,
    //       margin: { l: 0, r: 0, t: 0, b: 0 },
    //       title: "",
    //       coloraxis: {
    //         ...data.layout.coloraxis,
    //         colorbar: {
    //           ...data.layout.coloraxis.colorbar,
    //           xanchor: "right",
    //           yanchor: "middle",

    //           thickness: 10,
    //           x: 0.99,
    //           y: 0.5,
    //           len: 0.8,
    //           width: 0.1,
    //           title: {
    //             ...data.layout.coloraxis.colorbar.title,
    //             side: "right",
    //             font: {
    //               family: "Arial Black",
    //               size: 14,
    //             },
    //           },
    //         },
    //         colorscale: "Rainbow",
    //       },
    //       mapbox: {
    //         ...data.layout.mapbox,
    //         zoom: 11,
    //         center: {
    //           lat: 51.115,
    //           lon: -113.954,
    //         },
    //       },
    //     };
    //     setMapData(data);
    //     console.log(data);
    //     printResults();
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching data:", err);
    //     setError(err.message);
    //     setMapData(null);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }

  function printResults(mlTypeInfo, mlType) {
    const blob = new Blob([JSON.stringify(mlTypeInfo, null, 2)], {
      type: "application/json",
    });

    const anchor = document.createElement("a");

    anchor.download = `${mlType}_info.json`;

    anchor.href = window.URL.createObjectURL(blob);

    anchor.click();

    window.URL.revokeObjectURL(anchor.href);
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

  const postalFeatures = {
    median_assessed_value: true,
    median_land_size: true,
    distance_to_closest_elementary: true,
    distance_to_closest_junior_high: true,
    distance_to_closest_senior_high: true,
    school_count_within_1km: true,
    distance_to_closest_community_centre: true,
    distance_to_closest_attraction: true,
    distance_to_closest_visitor_info: true,
    distance_to_closest_court: true,
    distance_to_closest_library: true,
    distance_to_closest_hospital: true,
    distance_to_closest_phs_clinic: true,
    distance_to_closest_social_dev_centre: true,
    service_count_within_1km: true,
    n_clusters: 3,
    random_state: 42,
  };

  const headerSections = {
    "Demographics and Socioeconomic Indicators": [
      "count_of_population_in_private_households",
      "median_household_income",
      "count_of_population_considered_low_income",
      "count_of_private_households",
      "count_of_owner_households",
      "count_of_renter_households",
      "count_of_private_households_with_income",
      "count_of_households_with_lt_30_pct_of_total_income_on_shelter",
      "count_of_households_with_gt_30_pct_of_total_income_on_shelter",
      "median_owner_monthly_shelter_cost",
      "median_renter_monthly_shelter_cost",
    ],
    "Crime and Disorder": ["community_crime_count", "community_disorder_count"],
    "Housing Condition": [
      "count_of_households_that_require_maintenance",
      "count_of_households_that_require_major_repairs",
      "count_of_suitable_households",
      "count_of_unsuitable_households",
    ],
    "Property Assessments": ["median_assessed_value", "median_land_size"],
    Schools: [
      "distance_to_closest_elementary",
      "distance_to_closest_junior_high",
      "distance_to_closest_senior_high",
      "school_count_within_1km",
    ],
    Amenities: [
      "distance_to_closest_community_centre",
      "distance_to_closest_attraction",
      "distance_to_closest_visitor_info",
      "distance_to_closest_court",
      "distance_to_closest_library",
      "distance_to_closest_hospital",
      "distance_to_closest_phs_clinic",
      "distance_to_closest_social_dev_centre",
      "service_count_within_1km",
    ],
  };

  return (
    <React.Fragment>
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
          <Link to="/maps/algorithm">
            <button
              id="machine-learning-button"
              className={`menu-button ${
                isSelected("algorithm") ? "selected" : "map-feature-button"
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
          </Link>
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
                className="radio"
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
                className="radio"
              />
              <label htmlFor="postal-code-level-option">
                Sub-Community Level
              </label>
            </p>
          </form>

          <div id="slider" className="slider">
            <h3>Number of Clusters (Categories):</h3>
            <Box sx={{}}>
              <Slider
                defaultValue={3}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                shiftStep={1}
                step={1}
                min={1}
                max={20}
                className="slider-component"
                onChange={clusterCount}
              />
            </Box>
          </div>
          <div>{getFeatures()}</div>
          <div id="ml-run-btn" className="ml-run-btn">
            <button onClick={runML}>Run</button>
          </div>
          {/* <div>
            <button onClick={printResults}>Print Results</button>
          </div> */}
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
    </React.Fragment>
  );
};

export default Sidebar;
import Plot from "react-plotly.js";
import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "../components/styles/Maps.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Popup from "./Popup.js";
import { Tooltip } from "react-tooltip";
import {
  faArrowUpRightDots,
  faDollarSign,
  faScroll,
  faMapMarkerAlt,
  faSquarePollVertical,
  faCaretDown,
  faBars,
  faX,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Modal from "@mui/material/Modal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import { TablePagination } from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";

function Maps() {
  const { mapType } = useParams();
  const location = useLocation();
  const [showMLWindow, setShowMLWindow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapseLeft, setCollapseLeft] = useState(false);
  const [selectedMLOption, setSelectedMLOption] = useState("community-level");
  const [viewResults, setViewResults] = useState(false);
  const [MLResults, setMLResults] = useState({});
  const [FullMLResults, setFullMLResults] = useState({});
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [MLModalResults, setMLModalResults] = useState([]);
  const [MLModalFullResults, setMLModalFullResults] = useState([]);
  const [title, setTitle] = useState("Community Population Map");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [resultsType, setResultsType] = useState("");
  const [MLclusterCount, setMLclusterCount] = useState(3);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const isNothingSelected = () => {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;

    return !Object.values(features).includes(true);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const renderPopup = (description) => (
    <Popup
      trigger={
        <button>
          <FontAwesomeIcon icon={faInfoCircle} />
          <Tooltip effect="solid" delayShow={0} />
        </button>
      }
    >
      {description}
    </Popup>
  );

  const handleGenResults = () => {
    setResultsType("general");
  };

  const handleFullResults = () => {
    setResultsType("full");
  };

  const getResultsLength = () => {
    if (resultsType === "general") {
      return MLModalResults.length;
    } else {
      return MLModalFullResults.length;
    }
  };

  const handleOpenResultsModal = () => {
    setShowResultsModal(true);
  };

  const handleCloseResultsModal = () => {
    setShowResultsModal(false);
  };

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const handleLinkClick = () => {
    if (isSelected("congestion")) {
      setTitle("Community Population Map");
      setDescription(
        "This map considers human traffic to depict congestion's impact on housing choices."
      );
    } else if (isSelected("vacancy_per_community")) {
      setTitle("Land Vacancy Map");
      setDescription(
        "This map displays the vacancy rate within each community, indicating areas of high demand for housing."
      );
    } else if (isSelected("housing_development_zone")) {
      setTitle("Building Permits Map");
      setDescription(
        "This map displays development permits by community, indicating ongoing development activity."
      );
    } else if (isSelected("property_value_per_community")) {
      setTitle("House Price Map");
      setDescription(
        "This map shows the median house price for each community"
      );
    } else if (isSelected("algorithm")) {
      setTitle("Machine Learning Map");
      setDescription(
        "This map clusters areas, aiding users in finding ideal living spots. Customize, view changes, and download results."
      );
    }
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const renderTableHeaders = () => {
    const results =
      resultsType === "full" ? MLModalFullResults : MLModalResults;
    if (results.length > 0) {
      const headers = Object.keys(results[0]);
      return (
        <StyledTableRow>
          {headers.map((header) => (
            <StyledTableCell
              key={header}
              sortDirection={orderBy === header ? order : false}
            >
              <TableSortLabel
                active={orderBy === header}
                direction={orderBy === header ? order : "asc"}
                onClick={(event) => handleRequestSort(event, header)}
              >
                {header}
              </TableSortLabel>
            </StyledTableCell>
          ))}
        </StyledTableRow>
      );
    }
    return null;
  };

  const renderTableRows = () => {
    const results =
      resultsType === "full" ? MLModalFullResults : MLModalResults;
    return stableSort(results, getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((row, index) => (
        <StyledTableRow key={index}>
          {Object.values(row).map((value, colIndex) => (
            <TableCell key={colIndex}>{value.toString()}</TableCell>
          ))}
        </StyledTableRow>
      ));
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.info.dark,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    // "&:last-child td, &:last-child th": {
    //   border: 0,
    // },
  }));

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

  // const handleLastButtonToggle = () => {
  //   setLastButtonExpanded(!lastButtonExpanded);
  // };

  function valuetext(value) {
    return `${value}°C`;
  }

  const handleMLOptionChange = (event) => {
    console.log("New ML option selected:", event.target.value);
    setSelectedMLOption(event.target.value);
    setMLclusterCount(getClusterCount(event.target.value));
  };

  const isChecked = (event) => {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;

    const featureKey = event.target.id;
    const isChecked = event.target.checked;

    if (selectedMLOption === "community-level") {
      setCommunityFeatures((prevFeatures) => ({
        ...prevFeatures,
        [featureKey]: isChecked,
      }));
      localStorage.setItem(
        "communityFeatures",
        JSON.stringify({ ...communityFeatures, [featureKey]: isChecked })
      );
    } else {
      setPostalFeatures((prevFeatures) => ({
        ...prevFeatures,
        [featureKey]: isChecked,
      }));
      localStorage.setItem(
        "postalFeatures",
        JSON.stringify({ ...postalFeatures, [featureKey]: isChecked })
      );
    }

    console.log(features);
    console.log(featureKey);
  };

  const clusterCount = (event) => {
    const features =
      selectedMLOption === "community-level"
        ? communityFeatures
        : postalFeatures;
    const numClusters = parseInt(event.target.value, 10);

    if (selectedMLOption === "community-level") {
      setCommunityFeatures((prevFeatures) => ({
        ...prevFeatures,
        n_clusters: numClusters,
      }));
      localStorage.setItem(
        "communityFeatures",
        JSON.stringify({ ...communityFeatures, n_clusters: numClusters })
      );
    } else {
      setPostalFeatures((prevFeatures) => ({
        ...prevFeatures,
        n_clusters: numClusters,
      }));
      localStorage.setItem(
        "postalFeatures",
        JSON.stringify({ ...postalFeatures, n_clusters: numClusters })
      );
    }
    setMLclusterCount(numClusters);

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

  function getClusterCount(MLOption) {
    const loadedCommunityFeatures =
      JSON.parse(localStorage.getItem("communityFeatures")) || {};
    const loadedPostalFeatures =
      JSON.parse(localStorage.getItem("postalFeatures")) || {};

    const cnt =
      MLOption === "community-level"
        ? loadedCommunityFeatures !== undefined &&
          loadedCommunityFeatures["n_clusters"] !== undefined
          ? loadedCommunityFeatures["n_clusters"]
          : 5
        : loadedPostalFeatures !== undefined &&
          loadedPostalFeatures["n_clusters"] !== undefined
        ? loadedPostalFeatures["n_clusters"]
        : 5;
    return cnt;
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
            <input
              type="checkbox"
              id={feature}
              checked={
                selectedMLOption === "community-level"
                  ? communityFeatures[feature]
                  : postalFeatures[feature]
              }
              onChange={isChecked}
            />
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

  function fetchMLTypeInfo(mlType, features) {
    return fetch(`https://home-sphere.ca/api/api/${mlType}_info`, {
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
      .catch((err) => {
        console.error("Error fetching mlType_info:", err);
      });
  }

  function fetchMLTypeFullInfo(mlType, features) {
    return fetch(`https://home-sphere.ca/api/api/${mlType}_info_full`, {
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
      .catch((err) => {
        console.error("Error fetching mlType_info:", err);
      });
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

    setViewResults(true);

    setLoading(true);
    setError(null);
    setMapData(null);

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
        fetchMLTypeInfo(mlType, features)
          .then((mlTypeInfo) => {
            console.log(mlTypeInfo);
            setMLResults(mlTypeInfo);
            const parsedData = JSON.parse(mlTypeInfo);
            setMLModalResults(parsedData);
            // printResults(mlTypeInfo, mlType);
          })
          .catch((err) => {
            console.error("Error fetching mlType_info:", err);
          })
          .then((data) => {
            fetchMLTypeFullInfo(mlType, features)
              .then((mlTypeInfo) => {
                console.log(mlTypeInfo);
                setFullMLResults(mlTypeInfo);
                const parsedData = JSON.parse(mlTypeInfo);
                setMLModalFullResults(parsedData);
              })
              .catch((err) => {
                console.error("Error fetching mlType_info_full", err);
              });
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
              len: 0.75,
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
  }

  function printResults() {
    // Assuming MLResults is an array of objects
    const results =
      resultsType === "full" ? MLModalFullResults : MLModalResults;
    const data = results;

    // Convert JSON to CSV
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(",")); // Add column headers as the first row

    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = ("" + row[header]).replace(/"/g, '\\"'); // Escape double quotes
        return `"${escaped}"`; // Wrap each value in double quotes to handle commas in data
      });
      csvRows.push(values.join(",")); // Join each row's values by commas and add to the CSV array
    }

    const csvString = csvRows.join("\n"); // Join all rows by newline characters to form the CSV string

    // Trigger download
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.setAttribute("hidden", "");
    anchor.setAttribute("href", url);
    anchor.setAttribute(
      "download",
      `${selectedMLOption}_info_${resultsType}.csv`
    ); // Change file extension to .csv
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  function getLocalStorageData() {
    // Load features and cluster count from localStorage on initial render
    const loadedCommunityFeatures =
      JSON.parse(localStorage.getItem("communityFeatures")) || {};
    const loadedPostalFeatures =
      JSON.parse(localStorage.getItem("postalFeatures")) || {};

    const communityFeaturesState = {};
    const postalFeaturesState = {};

    // Default features for community-level
    Object.keys(communityFeaturesDefault).forEach((key) => {
      communityFeaturesState[key] =
        loadedCommunityFeatures[key] !== undefined
          ? loadedCommunityFeatures[key]
          : communityFeaturesDefault[key];
    });

    // Default features for postal-level
    Object.keys(postalFeaturesDefault).forEach((key) => {
      postalFeaturesState[key] =
        loadedPostalFeatures[key] !== undefined
          ? loadedPostalFeatures[key]
          : postalFeaturesDefault[key];
    });

    setCommunityFeatures({ ...communityFeaturesState });
    setPostalFeatures({ ...postalFeaturesState });
    selectedMLOption === "community-level"
      ? setMLclusterCount(communityFeaturesState["n_clusters"])
      : setMLclusterCount(postalFeaturesState["n_clusters"]);
  }

  const communityFeaturesDefault = {
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
    transit_stops_count: false,
    n_clusters: MLclusterCount,
    random_state: 42,
  };

  const [communityFeatures, setCommunityFeatures] = useState({});

  const postalFeaturesDefault = {
    median_assessed_value: false,
    median_land_size: false,
    distance_to_closest_elementary: false,
    distance_to_closest_junior_high: false,
    distance_to_closest_senior_high: false,
    school_count_within_1km: false,
    distance_to_closest_community_centre: false,
    distance_to_closest_attraction: false,
    distance_to_closest_visitor_info: false,
    distance_to_closest_court: false,
    distance_to_closest_library: false,
    distance_to_closest_hospital: false,
    distance_to_closest_phs_clinic: false,
    distance_to_closest_social_dev_centre: false,
    service_count_within_1km: false,
    distance_to_closest_bus_stop: false,
    distance_to_closest_ctrain_station: false,
    n_clusters: MLclusterCount,
    random_state: 42,
  };

  const [postalFeatures, setPostalFeatures] = useState({});

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
    "Transit Infromation": ["transit_stops_count"],
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
      "distance_to_closest_bus_stop",
      "distance_to_closest_ctrain_station",
    ],
  };

  useEffect(() => {
    getLocalStorageData();
  }, [selectedMLOption]);

  useEffect(() => {
    handleLinkClick();
    setLoading(true);
    setError(null);
    setMapData(null);
    if (isSelected("algorithm")) {
      setShowMLWindow(true);
    } else {
      setShowMLWindow(false);
    }

    fetch(`https://home-sphere.ca/api/maps/${mapType}`, {
      headers: {
        AccessToken: "Kvwf<IQ5qV]nlPooW@",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Please Run the Algorithm to View Results");
        }
        return response.json();
      })
      .then((data) => {
        data.layout = {
          ...data.layout,
          margin: { l: 0, r: 0, t: 0, b: 0 },
          coloraxis: {
            ...data.layout.coloraxis,
            colorbar: {
              ...data.layout.coloraxis.colorbar,
              xanchor: "right",
              yanchor: "middle",

              thickness: 10,
              x: 0.99,
              y: 0.5,
              len: 0.75,
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

  useEffect(() => {
    getLocalStorageData();
  }, []);

  return (
    <div>
      <div
        id="sidebar"
        className={`sidebar ${!showMLWindow ? "shortened" : ""} ${
          collapseLeft ? "hidden" : ""
        }`}
      >
        <div className="HomeSphere-Title">
          <h1>HOMESPHERE</h1>
          <h2>{title}</h2>
          <div className="icon-container">
            <span className="icon-tooltip">{description}</span>
            <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
          </div>

          <div id="buttons-container">
            <Link
              to="/maps/congestion"
              onClick={() => handleLinkClick("Community Population Map")}
            >
              <button
                id="population-button"
                className={`menu-button ${
                  isSelected("congestion") ? "selected" : "map-feature-button"
                }`}
              >
                <FontAwesomeIcon
                  icon={faArrowUpRightDots}
                  title="The Congestion Heatmap delves into the human factors influencing housing choices. This feature paints a comprehensive picture of congestion based on population."
                  className="fa-svg-icon"
                />
              </button>
            </Link>
            <Link
              to="/maps/vacancy_per_community"
              onClick={() => handleLinkClick("Land Vacancy Map")}
            >
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
            <Link
              to="/maps/housing_development_zone"
              onClick={() => handleLinkClick("Building Permits Map")}
            >
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
            <Link
              to="/maps/property_value_per_community"
              onClick={() => handleLinkClick("House Prices Map")}
            >
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
            <Link
              to="/maps/algorithm"
              onClick={() => handleLinkClick("Machine Learning Map")}
            >
              <button
                id="machine-learning-button"
                className={`menu-button ${
                  isSelected("algorithm") ? "selected" : "map-feature-button"
                }`}
              >
                <FontAwesomeIcon
                  icon={faSquarePollVertical}
                  title="Machine Learning Housing Analysis"
                  className="fa-svg-icon"
                />
              </button>
            </Link>
          </div>
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
                Postal Code Level
              </label>
            </p>
          </form>

          <div id="slider" className="slider">
            <h3>Number of Clusters (Categories):</h3>
            <Box sx={{}}>
              <Slider
                defaultValue={getClusterCount(selectedMLOption)}
                value={MLclusterCount}
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
          <div className="all-ml-btns">
            <div id="ml-run-btn" className="ml-btn">
              
              <button onClick={runML} disabled={isNothingSelected()}>
                Run
              </button>
            </div>

            <div
              id="ml-results-btn"
              className={`ml-btn ${viewResults ? "" : "hidden"}`}
            >
              <button
                className="view-results-btn"
                style= {{backgroundColor: 'blue'}}
                onClick={() => {
                  handleOpenResultsModal();
                  handleGenResults();
                }}
              >
                View General Results
              </button>
              <button
                style= {{backgroundColor: 'blue'}}
                onClick={() => {
                  printResults();
                  handleGenResults();
                }}
              >
                Download General Results
              </button>
              <button
                className="view-results-btn last-btn"
                style= {{backgroundColor: 'rgb(9 91 55)'}}

                onClick={() => {
                  handleOpenResultsModal();
                  handleFullResults();
                }}
              >
                View Detailed Results
              </button>
              <button
                style= {{backgroundColor: 'rgb(9 91 55)'}}
                onClick={() => {
                  printResults();
                  handleFullResults();
                }}
              >
                Download Detailed Results
              </button>
            </div>
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
      <Modal
        open={showResultsModal}
        onClose={handleCloseResultsModal}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper style={{ maxHeight: 800, overflow: "auto" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>{renderTableHeaders()}</TableHead>
            <TableBody>{renderTableRows()}</TableBody>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100, 250, 500]}
              component="div"
              count={getResultsLength()}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </Table>
        </Paper>
      </Modal>
      {loading && <div className="loader" />}
      {error && (
        <div className="screen-message">
          <p>{error}</p>
        </div>
      )}
      <div id="featureMap" className="featureMap">
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

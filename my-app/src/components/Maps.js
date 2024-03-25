import Plot from "react-plotly.js";
import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "../components/styles/Maps.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Popup from "./Popup.js";
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
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import { TablePagination } from "@mui/material";

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
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [MLModalResults, setMLModalResults] = useState([]);
  const [title, setTitle] = useState("Community Population Map");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
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
        "The Community Population Map delves into the human factors influencing housing choices. By considering human traffic, noise pollution, and proximity to neighboring houses, this feature paints a comprehensive picture of congestion. Overlay proximity to public transport, amenities, and healthcare facilities, illuminating accessibility as a crucial factor in housing decisions."
      );
    } else if (isSelected("vacancy_per_community")) {
      setTitle("Land Vacancy Map");
      setDescription(
        "The Land Vacancy Map shows the number to display the number of development permits granted by community to show how much development is occurring"
      );
    } else if (isSelected("housing_development_zone")) {
      setTitle("Building Permits Map");
      setDescription(
        "The Building Permits Map shows the number of building permits available for each community"
      );
    } else if (isSelected("property_value_per_community")) {
      setTitle("House Price Map");
      setDescription(
        "The House Prices Map shows the median house price for each community"
      );
    } else if (isSelected("algorithm")) {
      setTitle("Machine Learning Map");
      setDescription(
        "This is the Machine Learning Map, where unsupervised algorithms cluster communities and postal codes based on data patterns, ensuring flexibility in identifying optimal living areas in Northeast Calgary. Users can select options such as Community Level, Postal Code Level, and Number of Clusters (Categories). Users can observe reflected changes upon hitting 'Run', and download results as needed."
      );
    }
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const renderTableHeaders = () => {
    if (MLModalResults.length > 0) {
      const headers = Object.keys(MLModalResults[0]);
      return (
        <TableRow>
          {headers.map((header) => (
            <TableCell
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
            </TableCell>
          ))}
        </TableRow>
      );
    }
    return null;
  };

  const renderTableRows = () => {
    return stableSort(MLModalResults, getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((row, index) => (
        <TableRow key={index}>
          {Object.values(row).map((value, colIndex) => (
            <TableCell key={colIndex}>{value.toString()}</TableCell>
          ))}
        </TableRow>
      ));
  };

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

  function fetchMLTypeInfo(mlType, features) {
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
  }

  function printResults() {
    // Assuming MLResults is an array of objects
    const data = JSON.parse(MLResults);

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
    anchor.setAttribute("download", `${selectedMLOption}_info.csv`); // Change file extension to .csv
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
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
        className={`sidebar ${!showMLWindow ? "shortened" : ""} ${
          collapseLeft ? "hidden" : ""
        }`}
      >
        <div className="HomeSphere-Title">
          <h1>HOMESPHERE</h1>
          <h2>
            {title}
            <Popup
              trigger={
                <button onClick={togglePopup}>
                  <FontAwesomeIcon icon={faInfoCircle} />
                </button>
              }
              onClose={togglePopup}
            >
              {description}
            </Popup>
          </h2>
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
                title="Community Population"
                description="The Congestion Heatmap delves into the human factors influencing housing choices. By considering human traffic, noise pollution, and proximity to neighboring houses, this feature paints a comprehensive picture of congestion. Overlay proximity to public transport, amenities, and healthcare facilities, illuminating accessibility as a crucial factor in housing decisions."
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
          <div id="ml-run-btn" className="ml-btn">
            <button onClick={runML}>Run</button>
          </div>

          <div
            id="ml-results-btn"
            className={`ml-btn ${viewResults ? "" : "hidden"}`}
          >
            <button onClick={handleOpenResultsModal}>View Results</button>
            <button onClick={printResults}>Download Results</button>
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
        <Paper style={{ maxHeight: 500, overflow: "auto" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>{renderTableHeaders()}</TableHead>
            <TableBody>{renderTableRows()}</TableBody>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={MLModalResults.length}
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

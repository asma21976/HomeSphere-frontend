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
  faCaretDown,
  faBars,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Sidebar from "./Sidebar.js";

function MLMap() {
  const { mapType } = useParams();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      <Sidebar></Sidebar>

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

export default MLMap;

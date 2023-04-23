import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import exitX from "@/assets/icons/x-lg.svg";
import Result from "./Result/Result";
import styles from "./Map.module.scss";
import search from "@/pages/search";

function CenterAtUserLocation() {
  const map = useMap();
  map.locate().on("locationfound", (e) => {
    map.setView(e.latlng, 12);
  });
}

function AddMarkerToClick({ setHideModal, setResults }) {
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });

  const map = useMapEvents({
    async click(e) {
      const newMarker = e.latlng;
      setMarker(newMarker);
      const fetchedResults = await getResults(e.latlng.lat, e.latlng.lng);
      setResults(fetchedResults.businesses);
      setHideModal(false);
    },
  });

  async function getResults(lat, lon) {
    const response = await fetch(
      `/api/location?latitude=${lat}&longitude=${lon}`
    );
    const data = await response.json();
    return data;
  }
    

  useEffect(() => {
    map.locate().on("locationfound", async (e) => {
      setMarker(e.latlng);
    });
  }, []);

  useEffect(() => {
    map.setView([marker.lat, marker.lng]);
  }, [marker]);

  return (
    <>
      <Marker position={marker}>
        <Popup>
          ({marker.lat.toFixed(2)}, {marker.lng.toFixed(2)})
        </Popup>
      </Marker>
    </>
  );
}

export default function Map() {
  const [gotLocation, setGotLocation] = useState(false);
  const [hideModal, setHideModal] = useState(true);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [results, setResults] = useState([]);
  const [toastContent, setToastContent] = useState("");
  const notify = () =>
    toast(
      <>
        {toastContent} View your schedule <Link href="/schedule">here</Link>.
      </>
    );

  const LeafIcon = L.Icon.extend({ options: {} });
  const greenIcon = new LeafIcon({
    iconUrl:
      "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|2ecc71&chf=a,s,ee00FFFF",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setGotLocation(true);
    });
  }, []);

  const [searchEntry, setSearchEntry] = useState("");
  const [latitude, setLatitude] = useState([]);
  const [longitude, setLongitude] = useState([]);
  const [locations, setLocations] = useState([]);
  const [success, setSuccess] = useState(true);

  async function submitSearchEntry(e) {
    e.preventDefault();
   try {
    setSearchEntry(e.target.value);
    const response = await fetch(
      `https://geocode.maps.co/search?q=${e.target.value}`
    );
      const data = await response.json();
      showSearch(data);
   } catch {
    setSuccess(false);
   }
  }

  async function showSearch(searchResult) {
    const locations = [];
    const lats = [];
    const lons = [];
    let l = 0;

    if (searchResult.length > 0) {
      setSuccess(true);
      l = searchResult.length;
      
      if (l > 5) {
        l = 5;
      }
      // send max 5 locations
      for (let i = 0; i < l; i++) {
        const elipses = false;
        let s = searchResult[i].display_name;
        if (s.length > 50) {
          s = s.substring(0, 50);
          s = s + "..."
        }

        locations.push(s);
        lats.push(searchResult[i].lat);
        lons.push(searchResult[i].lon);
      }

      setLocations(locations);

      console.log("locs", locations);
    }
  }

  return (
    gotLocation && (
      <>
        <MapContainer center={center} zoom={12} style={{ height: "100vh" }}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AddMarkerToClick
            setHideModal={setHideModal}
            setResults={setResults}
          />
          {results.map((result, index) => (
            <Marker
              key={index}
              icon={greenIcon}
              position={{
                lat: result.coordinates.latitude,
                lng: result.coordinates.longitude,
              }}
            >
              <Popup>
                <Link href={result.url} style={{ fontSize: "15px" }}>
                  {result.name}
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className={styles.search}>
          <Form.Control
            type="search"
            placeholder="Search..."
            style={{
              borderRadius: "5px",
              boxShadow: "0px 3px 3px gray",
              minWidth: "500px",
            }}
            value={searchEntry}
            onChange={(e) => submitSearchEntry(e)}
          />
          <div>
            {success ? null : "Error: Please enter valid location."}
            {locations.map((loc, i) => (
                <p key={i} id={`loc${i}`}>{loc}</p>
            ))}
          </div>
            
          
          
            
          
        </div>
        <div
          className={styles.results + " p-5"}
          style={hideModal ? { display: "none" } : null}
        >
          <Row>
            <Col>
              <h1>
                <strong>Results</strong>
              </h1>
            </Col>
          </Row>
          {results.map((result, index) => (
            <Result
              key={index}
              count={index + 1}
              result={result}
              notify={notify}
              setToastContent={setToastContent}
            />
          ))}
          <Button variant="none" onClick={(_) => setHideModal(true)}>
            <Image
              src={exitX}
              alt="hide results modal"
              style={{ position: "absolute", top: 15, right: 15 }}
            />
          </Button>
        </div>
        <ToastContainer position="bottom-left" />
      </>
    )
  );
}

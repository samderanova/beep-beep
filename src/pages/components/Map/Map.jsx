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
          />
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

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
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
  const [marker, setMarker] = useState([0, 0]);

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

  return (
    <>
      <Marker position={marker}>
        <Popup>Marker is at {marker}</Popup>
      </Marker>
    </>
  );
}

export default function Map() {
  const [hideModal, setHideModal] = useState(true);
  const [center, setCenter] = useState([0, 0]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCenter(position.coords.latitude, position.coords.longitude);
    });
  }, []);

  return (
    <>
      <MapContainer center={center} zoom={12} style={{ height: "100vh" }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AddMarkerToClick setHideModal={setHideModal} setResults={setResults} />
      </MapContainer>
      <div className={styles.search}>
        <Form.Control
          type="search"
          placeholder="Search..."
          style={{ borderRadius: "3px", boxShadow: "0px 3px 3px gray" }}
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
          <Result key={index} count={index + 1} result={result} />
        ))}
        <Button variant="none" onClick={(_) => setHideModal(true)}>
          <Image
            src={exitX}
            alt="hide results modal"
            style={{ position: "absolute", top: 15, right: 15 }}
          />
        </Button>
      </div>
    </>
  );
}

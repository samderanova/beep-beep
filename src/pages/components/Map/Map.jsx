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
import Left from "@/assets/icons/left-chevron-svgrepo-com.svg";
import Right from "@/assets/icons/right-chevron-svgrepo-com.svg";
import Result from "./Result/Result";
import styles from "./Map.module.scss";

function AddMarkerToClick({ setHideModal, setResults, page, setPage }) {
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });
  const map = useMapEvents({
    async click(e) {
      const newMarker = e.latlng;
      setMarker(newMarker);
      const fetchedResults = await getResults(e.latlng.lat, e.latlng.lng, page);
      setResults(fetchedResults.businesses);
      setHideModal(false);
    },
  });

  async function getResults(lat, lon, page) {
    const response = await fetch(
      `/api/location?latitude=${lat}&longitude=${lon}&page=${page}`
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
    setPage(1);
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
  const [page, setPage] = useState(1);

  async function getResults(lat, lon, page) {
    const response = await fetch(
      `/api/location?latitude=${lat}&longitude=${lon}&page=${page}`
    );
    const data = await response.json();
    return data;
  }

  const notify = () =>
    toast(
      <>
        Schedule edited! View your complete schedule{" "}
        <Link href="/schedule">here</Link>.
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

  useEffect(() => {
    const genResults = async () => {
      const fetchedResults = await getResults(center.lat, center.lng, page);
      setResults(fetchedResults.businesses);
    };
    genResults().then();
  }, [page]);

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
            page={page}
            setPage={setPage}
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
          <div style={{ minHeight: "59vh" }}>
            {results.map((result, index) => (
              <Result
                key={index}
                count={index + 1}
                result={result}
                notify={notify}
              />
            ))}
            {results.length === 0 ? (
              <p className="mt-3">Oops! There's nothing here</p>
            ) : null}
          </div>
          <div className={styles.pagination}>
            <Button
              variant="none"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <Image
                src={Left}
                alt="left"
                style={{ width: "26px", height: "26px" }}
              />
            </Button>
            <p className="m-2 p-0" style={{ fontSize: "20px" }}>
              {page}
            </p>
            <Button
              variant="none"
              disabled={results.length < 10}
              onClick={() => setPage(page + 1)}
            >
              <Image
                src={Right}
                alt="right"
                style={{ width: "26px", height: "26px" }}
              />
            </Button>
          </div>
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

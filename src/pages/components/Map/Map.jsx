import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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
import search from "@/pages/search";

async function getResults(lat, lon) {
  const response = await fetch(
    `/api/location?latitude=${lat}&longitude=${lon}`
  );
  const data = await response.json();
  return data;
}

function AddMarkerToClick({ setHideModal, setResults, page, setPage, lati = 0, long = 0 }) {
  const [marker, setMarker] = useState({ lat: lati, lng: long });
  let popupRef = useRef();

  const map = useMapEvents({
    async click(e) {
      const newMarker = e.latlng;
      setMarker(newMarker);
      const fetchedResults = await getResults(e.latlng.lat, e.latlng.lng, page);
      setResults(fetchedResults.businesses);
      setHideModal(false);
    },
  });

  useEffect(() => {
    popupRef.current.openPopup();
  });

  useEffect(() => {
    map.locate().on("locationfound", async (e) => {
      setMarker(e.latlng);
    });
  }, []);

  useEffect(() => {
    map.setView([marker.lat, marker.lng]);
    setPage(1);
  }, [marker]);

  useEffect(() => {
    map.setView([lati, long]);
    setMarker({ lat: lati, lng: long });
    getResults(lati, long, page).then((response) => setResults(response.businesses));
    setHideModal(false);
  }, [lati, long]);

  return (
    <>
      <Marker ref={popupRef} position={marker}>
        <Popup>
          ({Number(marker.lat).toFixed(2)}, {Number(marker.lng).toFixed(2)})
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
  const [latitude, setLatitude] = useState([]);
  const [currLat, setCurrLat] = useState(0);
  const [longitude, setLongitude] = useState([]);
  const [currLon, setCurrLon] = useState(0);
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
      setCurrLat(position.coords.latitude);
      setCurrLon(position.coords.longitude);
      setGotLocation(true);
    });
  }, []);

  const [searchEntry, setSearchEntry] = useState("");
  const [locations, setLocations] = useState([]);
  const [success, setSuccess] = useState(true);
  const [l, setL] = useState(0);

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
      setL(l);
      // send max 5 locations
      for (let i = 0; i < l; i++) {
        const elipses = false;
        let s = searchResult[i].display_name;
        if (s.length > 50) {
          s = s.substring(0, 50);
          s = s + "...";
        }

        locations.push(s);
        lats.push(searchResult[i].lat);
        lons.push(searchResult[i].lon);
      }
      setLocations(locations);
      setLatitude(lats);
      setLongitude(lons);
    }
  }

  function updateLatLon(lat, lon) {
    setCurrLat(lat);
    setCurrLon(lon);
  }

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
            lati={currLat}
            long={currLon}
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
            value={searchEntry}
            onChange={(e) => submitSearchEntry(e)}
          />
          <div>
            {success ? null : "Error: Please enter valid location."}
            {locations.map((loc, i) => (
              <p
                key={i}
                id={`loc${i}`}
                onClick={(e) => updateLatLon(latitude[i], longitude[i])}
              >
                {loc}
              </p>
            ))}
          </div>
        </div>
        <div
          className={styles.results + " p-5"}
          style={hideModal ? { display: "none" } : null}
        >
          <Row className="align-items-center">
            <Col>
              <h1>
                <strong>Results</strong>
              </h1>
            </Col>
            <Col className="text-end">
              <Link href="/schedule">View Schedule</Link>
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
              <p className="mt-3">Oops! There&apos;s nothing here</p>
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
